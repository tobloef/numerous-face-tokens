import { SortOrder } from "../../../express-rest/src/utils/query";

type Sort<T extends object> = [keyof T, SortOrder];

export default Sort;
