const express = require("express")
const app = express()

const PORT = 3333;

const fs = require("fs");

//middleware
app.use(express.json());

app.get("/courses", (req, res) => {
    //load database
    const courses = require('./data.json')

    //return courses
    return res.json(courses)
});

app.get("/course/:id", (req, res) => {
    //load database
    const courses = require('./data.json')

    //get course by id from database
    const course = courses.find(
        (data) => data.id === Number(req.params.id)
        );

    if(!course){
        return res.status(404).json({
            status: "NOT_FOUND",
            message: `Course with id ${req.params.id} not found`, 
    })
    }

    //return course by id
    return res.json(course)

});

app.post("/course", (req, res) => {
    //load database
    const courses = require('./data.json')

    // build new course object
    const newCourse = {
        id: courses[courses.length - 1].id + 1,
        title: req.body.title,
        description: req.body.description,
        tags: req.body.tags,
    };

    //append new course to all courses
    courses.push(newCourse);

    // save updated courses to the file
    fs.writeFileSync(__dirname + "/data.json",
    JSON.stringify(courses, null, 2));

    console.log(newCourse);
    return res.status(201).json({
        
        status: "CREATED",
        data: newCourse,
    });

});

//update course by id
app.patch("/course/:id", (req, res) => {
    let     courses = require('./data.json')

    let updatedCourse = courses.find(
        (data) => data.id === Number(req.params.id)
        );

    if(!updatedCourse){
        return res.status(404).json({
            status: "NOT_FOUND",
            message: `Course with id ${req.params.id} not found`, 
    });
    };

    if (req.body.id) delete req.body.id;

    updatedCourse = {
        ...updatedCourse,
        ...req.body,
    }

    courses = courses.map((data) =>{
        if (data.id === Number(req.params.id)) {
            return updatedCourse;
        }   
            return data;
    });

    fs.writeFileSync(__dirname + "/data.json",
    JSON.stringify(courses, null, 2)
    );

    return res.status(200).json({
        status: "CREATED",
        data: updatedCourse,
    });

});

app.delete("/course/:id", (req, res) => {
    let courses = require('./data.json')
    
    const courseToDelete = courses.find(
        (data) => data.id === Number(req.params.id)
        );

    if(!courseToDelete){
        return res.status(404).json({
            status: "NOT_FOUND",
            message: `Course with id ${req.params.id} not found`,
        });
    };

    const filteredCourses = courses.filter(
        (data) => data.id !== Number(req.params.id)
    );

    fs.writeFileSync(__dirname + "/data.json",
    JSON.stringify(filteredCourses, null, 2)
    );

    return res.status(204).send({
        stats: "NO_CONTENT",
    });
});




    


app.listen(3333, () => {
    console.log(`Express server started on port ${PORT}`);
});