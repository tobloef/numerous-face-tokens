import Context from "./Context";
import UseCase from "./UseCase";

const runUseCase = (useCase: UseCase<any, any>, ctx: Context) => (
    async (req: Express.Request, res: Express.Response): Promise<void> => {
        const 
        useCase(request, ctx);
    }
)

export default runUseCase;