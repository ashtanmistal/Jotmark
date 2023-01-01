declare interface Navigator {
  chooseFileSystemEntries(options?: any): Promise<FileSystemHandle>;
}
