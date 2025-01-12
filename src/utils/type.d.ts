interface FileData {
  fileid: string;
  name: string;
  author: string;
  createdat: Date;
  deletedat: Date | null;
}

interface UserData {
  userid: string;
  email: string;
  password_hash: string;
  createdat: Date;
}