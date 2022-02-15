var subject = ["The apple", "Kevin", "The prophet", "The giant NYC rat", "The drawing",
"The son",
"The assistant",
"The salad",
"Their dinner",
"The company goal",
"Our holiday bonus",
"Its description",
"The annoying orange",
"Our investment"];
var verb = ["fell from", "kicked", "stared blankly at", "pleaded to "];
var object = ["the tree.", "the commanding officer.", "the dense textbook.", "the pizza slice."];

function rand(myList) {
  var e = Math.floor(Math.random() *  myList.length);
  return myList[e];
}


console.log(rand(subject) + " "
+ rand(verb) + " " + rand(object));
