const express = require("express")

const app = express()

app.listen(8080, "localhost",()=>{
    console.log("Server started at 8080")
})