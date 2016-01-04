var Controller = require("./Controller");
var ObjectId = require('mongodb').ObjectID;

function CardController(){

}


CardController.prototype = new Controller();

CardController.prototype.update = function(req,res){
    var POST = req.body;
    var db = req.db;
    var collection = db.get('respot');
    
    var cardID = req.params.cardID;
    
    var target = {"_id":ObjectId(cardID)};
    var query = {$set:{"front":POST.front,"back":POST.back}}
    
    collection.update(target,query,function(e){
        res.json({success:e == null})
    });
}
CardController.prototype.delete = function(req,res){
    var POST = req.body;
    var SESSION = req.session;
    var user = SESSION.user;
    var db = req.db;
    var collection = db.get('respot');
    var cardID = req.params.cardID;
    var deckID =  POST.deckID;
    
    collection.remove({"_id":cardID},function(e){
        // Update the srs
        
        var target = {"_id":ObjectId(user._id)};
        var query = {};
        query["srs."+deckID] = {"flashcardID":ObjectId(cardID)};
        console.log(target);
        console.log(query)
        collection.update(target,{$pull:query});
        
        
        /*
        collection.findById(user._id,function(e,doc){
            var srs = doc.srs[deckID];
            var srsQueue = srs.filter(function(e){
                return e.flashcardID != cardID;
            })
            
            srsQueue = srs.map(function(e){
                e.flashcardID = e.flashcardID;
                return e;
            })
            
            var target = {"_id":ObjectId(user._id)};
            var params = {};
            params["srs."+deckID] = srsQueue;
            console.log(target);
            console.log(params);
            collection.update(target,{$set:params});
        })*/
        
        // Update the deck
        var target = {"_id":ObjectId(deckID)};
        var query = {};
        query["cards"] = ObjectId(cardID);
        console.log(target);
        console.log(query);
        collection.update(target,{$pull:query});
    })
}

module.exports = CardController;