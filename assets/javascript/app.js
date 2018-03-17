var config = {
    apiKey: "AIzaSyB4k4KjjJ1-3Q1feNucOdnMhoDSX7OLpEg",
    authDomain: "rps-multiplayer-a5528.firebaseapp.com",
    databaseURL: "https://rps-multiplayer-a5528.firebaseio.com",
    projectId: "rps-multiplayer-a5528",
    storageBucket: "rps-multiplayer-a5528.appspot.com",
    messagingSenderId: "264292020831"
  };
  firebase.initializeApp(config);
  var database = firebase.database();
  
  const options = ["Rock","Paper","Scissors"];
  const matchups = [["Rock","Paper"],["Scissors","Rock"],["Paper","Scissors"]]
  var wins1 = 0;
  var wins2 = 0;
  var losses1 = 0;
  var losses2 = 0;
  
  var connectionsRef = database.ref("/connections");
  var connectedRef = database.ref(".info/connected");
  var players = database.ref("/players")
  
  var playerCounter = 0;
  var check = true;
  var user = 0;
  var turn = 1;

  var choiceOne = "";
  var choiceTwo = "";
  
  var createButtons = function(group){
    var optionDiv = $("<div>")
      for(var i=0; i<options.length; i++){
        var button = $("<button>");
        button.text(options[i])
        button.attr("data",options[i])
        button.attr("data-group", group)
        button.addClass("rps")
        optionDiv.append(button)
      }

      return optionDiv;
        
  }

  var declareResults = function(choice1,choice2){
      if(choice1==null || choice2==null){
          return;
      }
if(choice1 == choice2){
    console.log("draw");
    $("#battle-area").text("Draw")
}
for(var i=0; i<matchups.length; i++){
    if(choice2==matchups[i][1]&&choice1==matchups[i][0]){
        wins2++
        losses1++
        players.child("1").update({
            losses: losses1
        })
        players.child("2").update({
            wins: wins2
        })
        $("#battle-area").text(choice2+" Wins!");
    }
    else if(choice2==matchups[i][0]&&choice1==matchups[i][1]){
        wins1++
        losses2++
        players.child("1").update({
            wins: wins1
        })
        players.child("2").update({
            losses: losses2
        })
        $("#battle-area").text(choice1+" Wins!");
    }
}

}


$("#submit").on("click",function(){
    var name = $("#sign-in").val().trim();
    
    if(check==false){
        user = 1;
        
        var userId = players.child("1")
        userId.set({
        name: name,
        wins: 0,
        
        losses: 0,
        dateAdded: firebase.database.ServerValue.TIMESTAMP
        
    })
    }
    else if(check==true){
        user = 2;
        var userId = players.child("2")
        userId.set({
            name: name,
            wins: 0,
           
            losses: 0,
            dateAdded: firebase.database.ServerValue.TIMESTAMP
            
        })
    }
    
    userId.onDisconnect().remove()
    
    $("#connect").text("You are connected.")
})


database.ref("/players").on("value",function(snap){
    var player1 = snap.child("1") || "";
    var player2 = snap.child("2") || "";
    
    
    playerCounter = snap.numChildren();
    console.log("players in .onvalue: "+playerCounter)
    check = snap.child("1").exists();

    if(snap.numChildren()==2){
      database.ref().update({
          turn: turn
      })   
      
    }
    $("#player-one-name").text(snap.child("1/name").val()|| "Waiting for Player 1")
    $("#player-two-name").text(snap.child("2/name").val()|| "Waiting for Player 2")
    $("#player-one-record").text("Wins: "+snap.child("2/wins").val()+"  Losses: "+snap.child("2/losses").val()|| "")
    $("#player-two-record").text("Wins: "+snap.child("2/wins").val()+"  Losses: "+snap.child("2/losses").val()|| "")
})
database.ref("/players").on("child_added",function(snap){
    var pause = function(){
    if(playerCounter==2 && user==1){
        $(".rps").remove();
        $("#player-one-options").append(createButtons(1))
    }
    else if(playerCounter==2&&user==2){
        $("#player-one-options").text("Player 1 is choosing")
    } 
    }
    setTimeout(pause,1000) // I did this because playerCounter would not update in time before this function runs
})


$(document).on("click",".rps",function(){
    var choice = $(this).attr("data")
    var group = $(this).attr("data-group")
    $(".rps").remove();
    if(group==1){
        $("#player-one-options").html("<h1>"+choice+"</h1>")
        database.ref("/players/1").update({
            choice: choice
        })
        
    }
    else if(group==2){
        $("#player-two-options").html("<h1>"+choice+"</h1>")
        database.ref("/players/2").update({
            choice: choice
        })
    }
})

database.ref("/players/1/choice").on("value",function(snap){
    console.log("choice: "+snap.val())
    choiceOne = snap.val()
    if(user==2){
            $("#player-two-options").empty().append(createButtons(2))
        }
    if(user==1){
        $("#player-two-options").text("Player 2 is choosing")
    }
})
database.ref("/players/2/choice").on("value",function(snap){
    console.log("choice: "+snap.val())
    choiceTwo = snap.val()
    if(user==1){
        $("#player-two-options").text(choiceTwo)
    }
    else if(user==2){
        $("#player-one-options").text(choiceOne)
    }
    declareResults(choiceOne,choiceTwo);
    setTimeout(restart,3000)
})

var restart = function(){
    
        if(user==1){
            $("#player-one-options").empty().append(createButtons(1))
        


    }
}

database.ref("/players").on("child_removed",function(snap){
    if(snap.key==1){
        wins1=0
        losses1=0
        $("#player-one-options").empty()
    }
    else if(snap.key==2){
        wins2=0
        losses2=0
        $("#player-two-options").empty()
    }
})



// connectedRef.on("value", function(snap) {
    
     
//       if (snap.val()) {
    
   
//         var con = connectionsRef.push(true);
    
//         con.onDisconnect().remove();
//       }
//     });


//     connectionsRef.on("value", function(snap) {         
//       $("#chat-box").text(snap.numChildren());
      
//         });