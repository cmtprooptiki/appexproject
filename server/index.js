const express = require("express");

const mysql = require("mysql");
const bodyParser = require("body-parser");

const app=express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.listen(3000,  ()=> {
    console.log("Server started");
});

const db=mysql.createConnection(
    {

        // host : "5.77.39.26",
        // port:"3306",
        // database : "healthsu_limdb",
        // user :"healthsu_us",
        // password : "?VI%=smz(B~c"


        host : "5.77.39.26",
        port:"3306",
        database : "mproj_notificationDB",
        user :"mproj_notificationUser",
        password : "-Mr3SdN~pFZT"
        // host:'5.77.39.26',
        // port:'3306',
        // user:'mproj_user3',
        // password:'lMHSc{0Os+lk',
        // database:'mproj_db2023'

        // host:'localhost',
        // port:'3308',
        // user:'root',
        // password:'',
        // database:'issues'
    }
);

db.connect((err)=>{
    if (err){
        console.log("Unable to connect to DB");
    }
    console.log("Database connect successfully");
});

/*Generate method which handle queries */

function queryPromise(sql, values=[]){
    return new Promise((resolve,reject)=>{
        db.query(sql,values,(error,results)=>{
            if(error){
                reject(error);
            } else {
                resolve(results);
            }
        })
    });
}

/* POST API -Create New Resource */

app.post('/tickets',async(req,res)=>{
    try {
        //collact all data that comes in req.body
        var {title,description,active}= req.body;

        //validation
        if (!title || !description){
            throw new Error("title and description are mandatory")
        }

        //by default we are setting actvive as true
        if (!active){
            active=true;
        }
        //building the query
        const issue = [title,description,active];
        const SQL= "INSERT INTO tickets (title,description,active) VALUES (?,?,?)";

        const result = await queryPromise(SQL, issue);
        res.json({id: result.insertId,title,description,active});


    }
    catch(err){
        console.log(err);
        res.status(500).json({error:'Failed to create the ticket '});

    }
});



app.get('/tickets/search', async(req,res)=>{
    try{

        //collect the query
        const query =req.query.q;
        const SQL = 'SELECT * FROM tickets WHERE title LIKE ? OR description LIKE ?';

        const result = await queryPromise(SQL, [`%${query}%`,`%${query}%`]);

        if (result.length === 0 ){
            res.status(200).json({msg: 'no machting records found', length:result.length });
        }
        res.status(200).json(result);


    }catch(err){
        res.status(500).json({error:'Failed to search the tickets'});
    }

});

app.get('/data', async(req,res)=>{
    try{

        //collect the query
        // const query =req.query.q;
        // const SQL = 'SELECT * FROM tickets WHERE title LIKE ? OR description LIKE ?';
        const SQL = 'select * from erga';
        
        const result = await queryPromise(SQL);

        if (result.length === 0 ){
            res.status(200).json({msg: 'no machting records found', length:result.length });
        }
        
        res.status(200).json(result);


    }catch(err){
        res.status(500).json({error:'Failed to get survey data'});

    }

});



app.get('/tickets/:id',async(req,res)=>{
    try{
        const {id} = req.params;

        var SQL = 'SELECT * FROM tickets WHERE id = ?';
        const results = await queryPromise(SQL,[id]);

        if (results.length ==0){
            res.status(404).json({error:'not matching ticket  found'});
        }else {
            res.status(500).json(results[0]);
        }


    }catch(err){
        console.log(err);
        res.status(500).json({error:'Failed to fetch the ticket details'});

    }

});

app.put('/tickets/:id',async(req,res)=>{
    try{

        const id = req.params.id;
        const {title,description,active} = req.body;

        //
        const SQL="UPDATE tickets SET title=?, description = ? , active = ? WHERE id = ?";


        const results = await queryPromise(SQL , [title,description,active,id]);

        if (results.affectedRows == 0){
            res.status(404).json({error:'unable to find matching ticket'})
        }else {
            res.status(200).json({id: id, title, description , active});
        }

        
    }catch(err){
        console.log(err)
        res.status(500).json({error:'Failder to update the ticket'})
    }
});


app.delete('/tickets/:id',async(req,res)=>{
try{

    const id = req.params.id;
    const SQL = "DELETE FROM tickets WHERE id = ?";

    const result = await queryPromise(SQL, [id]);

    if (result.affectedRows === 0){
        res.status(404).json({error:'unable to find any matching ticket'});
    }else {
        res.status(200).json({msg:'Successfully deleted the ticket'});
    }


}catch(err){
    res.status(500).json({error:'Failed to delete the tickets'});
}
});

