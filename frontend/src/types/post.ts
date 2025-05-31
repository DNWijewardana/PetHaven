export type PostCategory = 'GENERAL' | 'LOST_PETS' | 'FOUND_PETS' | 'ADOPTION' | 'VOLUNTEER' | 'HELP' | 'SUCCESS_STORIES';

export interface Author {
  _id?: string;
  name: string;
  email: string;
  picture?: string;
}

export interface Reply {
  _id: string;
  content: string;
  author: Author;
  mentions?: string[];
  createdAt: string;
}

export interface Comment {
  _id: string;
  content: string;
  author: Author;
  mentions?: string[];
  replies?: Reply[];
  likes?: Author[];
  createdAt: string;
}

export interface Post {
  _id: string;
  title: string;
  content: string;
  category: PostCategory;
  author: Author;
  images?: string[];
  mentions?: string[];
  comments?: Comment[];
  likes?: Author[];
  createdAt: string;
  updatedAt: string;
} 