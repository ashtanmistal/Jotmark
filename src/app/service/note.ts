import {marked} from "marked";
import Image = marked.Tokens.Image;

export interface Note {
  pinned: boolean;
  lastModified: number;
  name: string;
  path: string; // this is the relative path of the service, and also defines the default tag (first subfolder if it exists)
  tags: string[];
  content: string;
  external: boolean;
  saved: boolean;
  images: Image[];
}
