import Never from "../types/Never";
import Optional from "../types/Optional";

function deleteProp<
    Obj extends object,
    Key extends keyof Obj,
>(
    obj: Obj,
    key: Key,
): Never<Obj, Key> {    
    const objCopy: Optional<Obj, Key> = {...obj}; 
    
    delete objCopy[key];

    return objCopy;
}

export default deleteProp;