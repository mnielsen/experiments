var buttons = [["#7", "7"], ["#8", "8"], ["#9", "9"], ["#plus", "+"], ["#equals", "="],
	       ["#4", "4"], ["#5", "5"], ["#6", "6"], ["#-", "-"],
	       ["#1", "1"], ["#2", "2"], ["#3", "3"], ["#x", "*"],
	       ["#0", "0"], ["#C", "C"], ["#decimal", "."], ["#divide", "/"]];

var j;

var e="";
var s="";

$(function() {
    for (j = 0; j < buttons.length; j++) {
	$(buttons[j][0]).click(onButton(j))
    };
    display("0");
});

function onButton(j) {
    return function() {pushButton(buttons[j][1])};
}

function display(s) {$("#screen").text(s)};


function pushButton(b) {
    var v;
    if (b=="+" || b=="-") {
	v = eval(e).toString();
	display(v);
	e = v+b;
	s = "";
    }
    else if (b=="*" || b=="/") {
	e += b;
	s = "";
    }
    else if (b=="C") {
	e = "";
	s = "";
	display("0");
    } else if (b=="=") {
	v = eval(e).toString();
	display(v);
	e = v;
	s = "";
    } else {
	e += b;
	s += b;
	display(s);
    }
}
