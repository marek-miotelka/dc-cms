import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ArticleFields, ArticleModel } from './models/Article.model';
import { CrudService } from '@api-server/database/crud.service';
import { Knex } from 'knex';

@Injectable()
export class ArticlesService
  extends CrudService<ArticleFields>
  implements OnModuleInit
{
  private articleModel!: ArticleModel;

  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {
    super();
  }

  onModuleInit() {
    this.articleModel = new ArticleModel({
      tableName: 'articles',
      knex: this.knex,
    });
    this.setModel(this.articleModel);
  }

  async findAll(): Promise<ArticleFields[]> {
    return this.articleModel.findAll();
  }

  async findByName(name: string): Promise<ArticleFields | null> {
    return this.articleModel.findByName(name);
  }
}
