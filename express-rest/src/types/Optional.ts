type Optional<Obj, Keys extends keyof Obj> =
  & Omit<Obj, Keys>
  & Partial<Pick<Obj, Keys>>;

export default Optional;
