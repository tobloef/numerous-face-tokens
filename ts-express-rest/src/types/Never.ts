type Never<Obj, Keys extends keyof Obj> =
    & Omit<Obj, Keys>
    & Record<Keys, never>;

export default Never;