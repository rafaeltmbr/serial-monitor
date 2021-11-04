interface IParams {
  source: string;
  search: string;
}

type FuncType = (params: IParams) => void;

export const containString: FuncType = ({ source, search }) =>
  source.toLocaleLowerCase().indexOf(search.toLocaleLowerCase()) >= 0;
