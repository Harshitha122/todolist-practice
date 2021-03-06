//jshint esversion:6

/*const express= require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + '/date.js');

const app=express();
let newlistitems=["Do coding","Sleep Well","Do projects"];
let workitems=[];
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.get("/",function(req,res){
    const day = date.getDate();
    res.render("list", {listTitle:day, newlistitems:newlistitems});
});

app.get("/work",function(req,res){
    res.render("list",{listTitle:"Work List",newlistitems:workitems});
});
app.post("/",function(req,res){
    if(req.body.listSubmit === "Work"){
        workitems.push(req.body.newitem);
        res.redirect("/work");
      }else{
        newlistitems.push(req.body.newitem);
        res.redirect("/");
      }
});

app.listen(3000,function(){
    console.log("Server started on port 3000");
});  */
const express = require("express");
const bodyParser = require("body-parser");
const mongoose =require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Harshitha122:Harshitha@122@cluster0.duxzu.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});
//mongodb+srv://Harshitha122:Harshitha@122@cluster0.duxzu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
//test?retryWrites=true&w=majority
//// ITEM SCHEMA////
const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

////DEFAULT ITEMS////
const item1 = new Item ({
    name: "Type a new item below"
  });

const item2 = new Item ({
    name: "Click the + button to add the new item"
  });

const item3 = new Item ({
    name: "<--Click this to delete an item"
  });


const defaultItems = [item1, item2, item3];

////CUSTOM LIST ITEM SCHEMA////
const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

//////HOME ROUTE/////
app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {

    if (foundItems.length === 0) {
        Item.insertMany(defaultItems, function(err) {
          if (err) {
            console.log(err); 
          } else {
            console.log("Successfully saved default items to DB");
          }
        });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  })

});

/////ADD NEW ITEM/////
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (itemName !== "") {

    if (listName === "Today") {
     item.save();
     res.redirect("/");

   }  else {
     ///// for custom list////
     List.findOne({name: listName}, function(err, foundList) {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      })
   }
  }

});

/////CUSTOM LIST//////
app.get("/:customListName", function(req, res) {

    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}, function(err, foundList) {
      if (!err) {
        if (!foundList) {

         ////create a new list////
          const list = new List ({
              name: customListName,
              items: defaultItems
            })

            list.save();
            res.redirect("/" + customListName);
        } else {

        /////Show an existing list////       
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
        }

      }
    })
});


////DELETE ITEM/////
app.post("/delete", function(req, res) {
  
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {

    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (!err) {
        console.log("Successfully deleted item");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList) {
       if(!err) {
         res.redirect("/" + listName);
       }
    }) 
  }

    
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started successfully!");
});