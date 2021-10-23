type ParseRouteParameters<Route> = 
  Route extends `${string}/:${infer Param}/${infer Rest}` ? 
    { [Entry in Param | keyof ParseRouteParameters<`/${Rest}`>]: string } : 
  Route extends `${string}/:${infer Param}` ?
    { [Entry in Param]: string } : {};

export default ParseRouteParameters;