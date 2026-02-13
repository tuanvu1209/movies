export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Search: undefined;
  Watch: {
    id: string;
    episode?: number;
  };
  Category: {
    slug: string;
    page?: number;
  };
};
