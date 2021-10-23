type Never<Obj, Keys extends keyof Obj> =
    & Omit<Obj, Keys>
    & { [Prop in Keys]: never } 

export default Never;