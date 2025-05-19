export const validate = (schema) => (req,res,next)=>{
    const result = schema.safeParse(req.body);
    if(result.success){
        next();
    } else {
        return res.status(400).json({message: result.error.errors})
    }
}