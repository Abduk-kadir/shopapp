let {data}=require('./data')
let {products}=data;
let express=require("express");
const { Client } = require("pg");
let app=express()
app.use(express.json())
app.use(function(req,res,next){
    res.header("Access-Control-Allow-Origin","*")
    res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS, PUT, PATCH, DELETE, HEAD"

    );
    res.header(
        "Access-Control-Allow-Headers",
        "Origin,X-Requested-With ,Content-Type, Accept"

    );
    next();

   
});
const client=new Client({
    user:"postgres",
    password:"iltutmish@2022",
    database:"postgres",
    port:5432,
    host:"db.flfurqnvbdlcuhsyrwoz.supabase.co",
    ssl:{rejectUnauthorized:false}
})
client.connect(function(res,err){
    console.log('connect ot superbase data base')
})
//const port=2410
const port = process.env.PORT || 2410
app.listen(port,()=>console.log(`Node app is listinng${port}`))
app.get('/shops',function(req,res){
    let sql='select shopid,name from shops';
    client.query(sql,function(err,result){
        if(err){
            console.log(err)
            res.status(404).send(err)
        }
        else{
            res.send(result.rows)
        }
    })

})
app.post('/shops',function(req,res){
    let arr=Object.values(req.body)
    let sql='insert into shops(name,rent) values($1,$2)'
    client.query(sql,arr,function(err,result){
        if(err){
            console.log(err)
            res.status(404).send(err)
        }
        else{
            res.send('shop is successfully added to database')
        }
    })
    
})
app.get('/products',function(req,res){
    let sql='select * from products';
    client.query(sql,function(err,result){
        if(err){
            console.log(err)
            res.status(404).send(err)
        }
        else{
            res.send(result.rows)
        }
    })

})
app.post('/products',function(req,res){
    let arr=Object.values(req.body)
    let sql='insert into products(productname,category,description) values($1,$2,$3)'
    client.query(sql,arr,function(err,result){
        if(err){
            console.log(err)
            res.status(404).send(err)
        }
        else{
            res.send('product is successfully added to database')
        }
    })
    
})
app.put('/products/:id',function(req,res){

    let {id}=req.params;
    let {body}=req;
    let {category,description}=body
    let sql='update products set category=$1,description=$2 where productid=$3'
    client.query(sql,[category,description,id],function(err,result){
        if(err){
            console.log(err)
            res.status(404).send(err)
        }
        else{
            let no=result.rowCount;
            res.send(`${no} rows is updated`)
        }
    })
    
})

app.get('/purchases',function(req,res){
    let sql='select shopid,productid,quantity,price from purchase';
    let {shop,product,sort}=req.query
    let arr1;
    let arr2;
    if(shop){
        arr1=shop.split(',')
    }
    if(product){
        arr2=product.split(',')
    }
    
    client.query(sql,function(err,result){
        if(err){
            console.log(err)
            res.status(404).send(err)
        }
        else{
          
           let newarr=shop?result.rows.filter(elem=>arr1.find(val=>val==elem.shopid)):result.rows
           newarr=product?newarr.filter(elem=>arr2.find(val=>val==elem.productid)):newarr
         
           if(sort=='QtyAsc'){
            newarr.sort((elem1,elem2)=>elem1.quantity-elem2.quantity)
           }
           if(sort=='QtyDesc'){
            newarr.sort((elem1,elem2)=> -(elem1.quantity-elem2.quantity))
           }
           if(sort=='ValueAsc'){
            newarr.sort((elem1,elem2)=> (elem1.quantity*elem1.price)-(elem2.quantity*elem2.price))
           }
           if(sort=='ValueDesc'){
            newarr.sort((elem1,elem2)=>-((elem1.quantity*elem1.price)-(elem2.quantity*elem2.price)))
           }
           res.send(newarr)
        }
    })

})

app.get('/purchases/shops/:id',function(req,res){
    let {id}=req.params
    let sql='select name,shops.shopid,quantity,price,productname,purchase.productid from shops inner join purchase on shops.shopid=purchase.shopid join products on purchase.productid=products.productid where shops.shopid=$1';
    client.query(sql,[id],function(err,result){
        if(err){
            console.log(err)
            res.status(404).send(err)
        }
        else{
            res.send(result.rows)
        }
    })

})
app.get('/purchases/products/:id',function(req,res){
    let {id}=req.params
    let sql='select products.productid,productname ,quantity,price,name from products inner join purchase on products.productid=purchase.productid join shops on purchase.shopid=shops.shopid where products.productid=$1';
    client.query(sql,[id],function(err,result){
        if(err){
            console.log(err)
            res.status(404).send(err)
        }
        else{
            res.send(result.rows)
        }
    })

})
app.get('/totalpurchase/shop/:id',function(req,res){
    let {id}=req.params
    let sql=' select shopid,productid,sum(price*quantity) as totatprice from purchase where shopid=$1 group by shopid,productid;';
    client.query(sql,[id],function(err,result){
        if(err){
            console.log(err)
            res.status(404).send(err)
        }
        else{
            res.send(result.rows)
        }
    })

})

app.get('/totalpurchase/product/:id',function(req,res){
    let {id}=req.params
    let sql='select shopid,sum(price*quantity) as totalprice from purchase where productid=$1 group by shopid;';
    client.query(sql,[id],function(err,result){
        if(err){
            console.log(err)
            res.status(404).send(err)
        }
        else{
            res.send(result.rows)
        }
    })

})
app.post('/purchases',function(req,res){
    let arr=Object.values(req.body)
    
    let sql='insert into purchase(shopid,productid,quantity,price) values($1,$2,$3,$4)'
    client.query(sql,arr,function(err,result){
        if(err){
            console.log(err)
            res.status(404).send(err)
        }
        else{
            res.send('product is successfully added to database')
        }
    })
    
})



