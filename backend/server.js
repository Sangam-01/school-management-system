const express=require("express")

const cors=require('cors')

//user defined modules
const userRouter=require('./routes/user')
const teacherRouter=require('./routes/teacher')
const principalRouter=require('./routes/principal')
const studentRouter=require('./routes/student')
const classRouter=require('./routes/class')
<<<<<<< HEAD
const subjectRouter=require('./routes/subject')
=======
const accRouter=require('./routes/accountant')
const authRouter=require('./routes/Auth')
>>>>>>> newApis

const app=express()


//Middlewares
app.use(express.json())
app.use('/user',userRouter)
app.use('/teacher',teacherRouter)
app.use('/principal',principalRouter)
app.use('/student',studentRouter)
app.use('/class',classRouter)
<<<<<<< HEAD
app.use('/subject',subjectRouter)
=======
app.use('/accountant', accRouter)
app.use('/auth',authRouter)
>>>>>>> newApis

app.listen(4000,'localhost',()=>{
    console.log('server started at port 4000')

})