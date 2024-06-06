export interface Text {
  title: string;
  body: string;
  author: string | null;
  publish_date: null | string;
  id: number;
  chunks: number;
}