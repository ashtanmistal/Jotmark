export interface Note {
  lastModified: number;
  name: string;
  path: string; // this is the relative path of the note, and also defines the default tag (first subfolder if it exists)
  tags: string[];
  content: string;
  external: boolean;
  saved: boolean;
}
