import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../../entities/comment.entity';
import { User } from '../../entities/user.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findByDishId(dishId: number, currentUser: any, params: { page?: number | string; size?: number | string }) {
    const page = Number(params.page) || 1;
    const size = Number(params.size) || 10;

    // 构建查询：只获取顶级评论（parent_id 为 null）
    const qb = this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .where('comment.dishId = :dishId', { dishId })
      .andWhere('comment.parentId IS NULL')
      .andWhere('comment.status = :status', { status: 1 });

    // 按组过滤：通过评论者的 adminUid 过滤
    if (currentUser.role === 'customer') {
      // 顾客看到同组评论 + 管理员发的评论
      qb.andWhere('(user.adminUid = :adminUid OR comment.uid = :adminUid)', { adminUid: currentUser.adminUid });
    } else if (currentUser.role === 'admin') {
      // 管理员看到自己组的评论 + 自己发的评论
      qb.andWhere('(user.adminUid = :adminUid OR comment.uid = :adminUid)', { adminUid: currentUser.uid });
    }

    qb.orderBy('comment.isTop', 'DESC')
      .addOrderBy('comment.createdAt', 'DESC')
      .skip((page - 1) * size)
      .take(size);

    const [list, total] = await qb.getManyAndCount();

    // 加载回复（同样按组过滤）
    const commentsWithReplies = await Promise.all(
      list.map(async (comment) => {
        const replyQb = this.commentRepository
          .createQueryBuilder('comment')
          .leftJoinAndSelect('comment.user', 'user')
          .where('comment.parentId = :parentId', { parentId: comment.commentId })
          .andWhere('comment.status = :status', { status: 1 });

        if (currentUser.role === 'customer') {
          replyQb.andWhere('(user.adminUid = :adminUid OR comment.uid = :adminUid)', { adminUid: currentUser.adminUid });
        } else if (currentUser.role === 'admin') {
          replyQb.andWhere('(user.adminUid = :adminUid OR comment.uid = :adminUid)', { adminUid: currentUser.uid });
        }

        replyQb.orderBy('comment.createdAt', 'ASC');
        const replies = await replyQb.getMany();

        return {
          commentId: comment.commentId,
          content: comment.content,
          rating: comment.rating,
          isTop: comment.isTop,
          user: {
            uid: comment.user?.uid,
            nickname: comment.user?.nickname,
            avatar: comment.user?.avatar,
          },
          replies: replies.map((reply) => ({
            commentId: reply.commentId,
            content: reply.content,
            user: {
              uid: reply.user?.uid,
              nickname: reply.user?.nickname,
              avatar: reply.user?.avatar,
            },
            createdAt: reply.createdAt,
          })),
          createdAt: comment.createdAt,
        };
      }),
    );

    return { list: commentsWithReplies, total, page, size };
  }

  async create(
    uid: number,
    dishId: number,
    content: string,
    rating: number,
    parentId?: number,
  ) {
    // 如果是回复，验证只能回复自己组的评论
    if (parentId) {
      const parentComment = await this.commentRepository.findOne({
        where: { commentId: parentId },
        relations: ['user'],
      });
      if (!parentComment) {
        throw new NotFoundException('被回复的评论不存在');
      }

      const currentUser = await this.userRepository.findOne({ where: { uid } });
      if (!currentUser) throw new NotFoundException('用户不存在');

      // 验证：只能回复自己组的评论
      if (currentUser.role === 'admin') {
        // 管理员只能回复自己组顾客的评论
        if (parentComment.user?.adminUid !== currentUser.uid) {
          throw new ForbiddenException('只能回复自己组的评论');
        }
      } else if (currentUser.role === 'customer') {
        // 顾客只能回复同组的评论
        if (parentComment.user?.adminUid !== currentUser.adminUid) {
          throw new ForbiddenException('只能回复同组的评论');
        }
      }
    }

    const comment = this.commentRepository.create({
      uid,
      dishId,
      content,
      rating,
      parentId,
      status: 1,
    });

    return this.commentRepository.save(comment);
  }

  async removeAsAdmin(commentId: number, adminUid: number) {
    const comment = await this.commentRepository.findOne({
      where: { commentId },
      relations: ['user'],
    });
    if (!comment) throw new NotFoundException('评论不存在');
    if (comment.user?.adminUid !== adminUid) {
      throw new ForbiddenException('只能删除自己组的评论');
    }
    comment.status = 0;
    return this.commentRepository.save(comment);
  }

  async toggleTopAsAdmin(commentId: number, adminUid: number, isTop: number) {
    const comment = await this.commentRepository.findOne({
      where: { commentId },
      relations: ['user'],
    });
    if (!comment) throw new NotFoundException('评论不存在');
    if (comment.user?.adminUid !== adminUid) {
      throw new ForbiddenException('只能操作自己组的评论');
    }
    comment.isTop = isTop;
    return this.commentRepository.save(comment);
  }
}
