export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Watch: {
    id: string;
    episode?: number;
  };
  Category: {
    slug: string;
    page?: number;
  };
};
