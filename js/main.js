var sigInst, canvas, $GP

//Load configuration file
var config={};

//For debug allow a config=file.json parameter to specify the config
function GetQueryStringParams(sParam,defaultVal) {
    var sPageURL = ""+window.location;//.search.substring(1);//This might be causing error in Safari?
    if (sPageURL.indexOf("?")==-1) return defaultVal;
    sPageURL=sPageURL.substr(sPageURL.indexOf("?")+1);    
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {
            return sParameterName[1];
        }
    }
    return defaultVal;
}


jQuery.getJSON(GetQueryStringParams("config","config.json"), function(data, textStatus, jqXHR) {
	config=data;
	
	if (config.type!="network") {
		//bad config
		alert("Invalid configuration settings.")
		return;
	}
	
	//As soon as page is ready (and data ready) set up it
	$(document).ready(setupGUI(config));
});//End JSON Config load


// FUNCTION DECLARATIONS

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

function initSigma(config) {
	var data=config.data
	
	var drawProps, graphProps,mouseProps;
	if (config.sigma && config.sigma.drawingProperties) 
		drawProps=config.sigma.drawingProperties;
	else
		drawProps={
        defaultLabelColor: "#000",
        defaultLabelSize: 2,
        defaultLabelBGColor: "#ddd",
        defaultHoverLabelBGColor: "#002147",
        defaultLabelHoverColor: "#fff",
        labelThreshold: 15,
        defaultEdgeType: "curve",
	defaultEdgeColor: "rgba(211, 211, 211, 0.5)", // Set custom default edge color
        hoverFontStyle: "bold",
        fontStyle: "bold",
        activeFontStyle: "bold"
    };
    
    if (config.sigma && config.sigma.graphProperties)	
    	graphProps=config.sigma.graphProperties;
    else
    	graphProps={
        minNodeSize: 1,
        maxNodeSize: 7,
        minEdgeSize: 0.2,
        maxEdgeSize: 0.5
    	};
	
	if (config.sigma && config.sigma.mouseProperties) 
		mouseProps=config.sigma.mouseProperties;
	else
		mouseProps={
        minRatio: 0.75, // How far can we zoom out?
        maxRatio: 20, // How far can we zoom in?
    	};
	
    var a = sigma.init(document.getElementById("sigma-canvas")).drawingProperties(drawProps).graphProperties(graphProps).mouseProperties(mouseProps);
    sigInst = a;
    a.active = !1;
    a.neighbors = {};
    a.detail = !1;


    dataReady = function() {//This is called as soon as data is loaded
		a.clusters = {};

		a.iterNodes(
			function (b) { //This is where we populate the array used for the group select box

				// note: index may not be consistent for all nodes. Should calculate each time. 
				 // alert(JSON.stringify(b.attr.attributes[5].val));
				// alert(b.x);
				a.clusters[b.color] || (a.clusters[b.color] = []);
				a.clusters[b.color].push(b.id);//SAH: push id not label
			}
		
		);
	
		a.bind("upnodes", function (a) {
		    nodeActive(a.content[0])
		});

		a.draw();
		configSigmaElements(config);
	}

    if (data.indexOf("gexf")>0 || data.indexOf("xml")>0)
        a.parseGexf(data,dataReady);
    else
	    a.parseJson(data,dataReady);
    gexf = sigmaInst = null;
}


function setupGUI(config) {
	// Initialise main interface elements
	var logo=""; // Logo elements
	if (config.logo.file) {

		logo = "<img src=\"" + config.logo.file +"\"";
		if (config.logo.text) logo+=" alt=\"" + config.logo.text + "\"";
		logo+=">";
	} else if (config.logo.text) {
		logo="<h1>"+config.logo.text+"</h1>";
	}
	if (config.logo.link) logo="<a href=\"" + config.logo.link + "\">"+logo+"</a>";
	$("#maintitle").html(logo);

	// #title
	$("#title").html("<h2>"+config.text.title+"</h2>");

	// #titletext
	$("#titletext").html(config.text.intro);

	// More information
	if (config.text.more) {
		$("#information").html(config.text.more);
	} else {
		//hide more information link
		$("#moreinformation").hide();
	}

	// Legend

	// Node
	if (config.legend.nodeLabel) {
		$(".node").next().html(config.legend.nodeLabel);
	} else {
		//hide more information link
		$(".node").hide();
	}
	// Edge
	if (config.legend.edgeLabel) {
		$(".edge").next().html(config.legend.edgeLabel);
	} else {
		//hide more information link
		$(".edge").hide();
	}
	// Topic
	if (config.legend.topicLabel) {
		$(".topic").next().html(config.legend.topicLabel);
	} else {
		//hide more information link
		$(".topic").hide();
	}
	// Colours
	if (config.legend.nodeLabel) {
		$(".colours").next().html(config.legend.colorLabel);
	} else {
		//hide more information link
		$(".colours").hide();
	}

	$GP = {
		calculating: !1,
		showgroup: !1
	};
    $GP.intro = $("#intro");
    $GP.minifier = $GP.intro.find("#minifier");
    $GP.mini = $("#minify");
    $GP.info = $("#attributepane");
    $GP.info_donnees = $GP.info.find(".nodeattributes");
    $GP.info_name = $GP.info.find(".name");
    $GP.info_link = $GP.info.find(".link");
    $GP.info_data = $GP.info.find(".data");
    $GP.info_close = $GP.info.find(".returntext");
    $GP.info_close2 = $GP.info.find(".close");
    $GP.info_p = $GP.info.find(".p");
    $GP.info_close.click(nodeNormal);
    $GP.info_close2.click(nodeNormal);
    $GP.form = $("#mainpanel").find("form");
    $GP.search = new Search($GP.form.find("#search"));
    if (!config.features.search) {
		$("#search").hide();
	}
	if (!config.features.groupSelectorAttribute) {
		$("#attributeselect").hide();
	}
    $GP.cluster = new Cluster($GP.form.find("#attributeselect"));
    config.GP=$GP;
    initSigma(config);
}

function configSigmaElements(config) {
	$GP=config.GP;
    
    // Node hover behaviour
    if (config.features.hoverBehavior == "dim") {

		var greyColor = '#ccc';
		sigInst.bind('overnodes',function(event){
		var nodes = event.content;
		var neighbors = {};
		sigInst.iterEdges(function(e){
		if(nodes.indexOf(e.source)<0 && nodes.indexOf(e.target)<0){
			if(!e.attr['grey']){
				e.attr['true_color'] = e.color;
				e.color = greyColor;
				e.attr['grey'] = 1;
			}
		}else{
			e.color = e.attr['grey'] ? e.attr['true_color'] : e.color;
			e.attr['grey'] = 0;

			neighbors[e.source] = 1;
			neighbors[e.target] = 1;
		}
		}).iterNodes(function(n){
			if(!neighbors[n.id]){
				if(!n.attr['grey']){
					n.attr['true_color'] = n.color;
					n.color = greyColor;
					n.attr['grey'] = 1;
				}
			}else{
				n.color = n.attr['grey'] ? n.attr['true_color'] : n.color;
				n.attr['grey'] = 0;
			}
		}).draw(2,2,2);
		}).bind('outnodes',function(){
		sigInst.iterEdges(function(e){
			e.color = e.attr['grey'] ? e.attr['true_color'] : e.color;
			e.attr['grey'] = 0;
		}).iterNodes(function(n){
			n.color = n.attr['grey'] ? n.attr['true_color'] : n.color;
			n.attr['grey'] = 0;
		}).draw(2,2,2);
		});

    } else if (config.features.hoverBehavior == "hide") {

		sigInst.bind('overnodes',function(event){
			var nodes = event.content;
			var neighbors = {};
		sigInst.iterEdges(function(e){
			if(nodes.indexOf(e.source)>=0 || nodes.indexOf(e.target)>=0){
		    	neighbors[e.source] = 1;
		    	neighbors[e.target] = 1;
		  	}
		}).iterNodes(function(n){
		  	if(!neighbors[n.id]){
		    	n.hidden = 1;
		  	}else{
		    	n.hidden = 0;
		  }
		}).draw(2,2,2);
		}).bind('outnodes',function(){
		sigInst.iterEdges(function(e){
		  	e.hidden = 0;
		}).iterNodes(function(n){
		  	n.hidden = 0;
		}).draw(2,2,2);
		});

    }
    $GP.bg = $(sigInst._core.domElements.bg);
    $GP.bg2 = $(sigInst._core.domElements.bg2);
    var a = [],
        b,x=1;
		for (b in sigInst.clusters) a.push('<div style="line-height:12px"><a href="#' + b + '"><div style="width:40px;height:12px;border:1px solid #fff;background:' + b + ';display:inline-block"></div> Group ' + (x++) + ' (' + sigInst.clusters[b].length + ' members)</a></div>');
    //a.sort();
    $GP.cluster.content(a.join(""));
    b = {
        minWidth: 400,
        maxWidth: 800,
        maxHeight: 600
    };//        minHeight: 300,
    $("a.fb").fancybox(b);
    $("#zoom").find("div.z").each(function () {
        var a = $(this),
            b = a.attr("rel");
        a.click(function () {
			if (b == "center") {
				sigInst.position(0,0,1).draw();
			} else {
		        var a = sigInst._core;
	            sigInst.zoomTo(a.domElements.nodes.width / 2, a.domElements.nodes.height / 2, a.mousecaptor.ratio * ("in" == b ? 1.5 : 0.5));		
			}

        })
    });
    $GP.mini.click(function () {
        $GP.mini.hide();
        $GP.intro.show();
        $GP.minifier.show()
    });
    $GP.minifier.click(function () {
        $GP.intro.hide();
        $GP.minifier.hide();
        $GP.mini.show()
    });
    $GP.intro.find("#showGroups").click(function () {
        !0 == $GP.showgroup ? showGroups(!1) : showGroups(!0)
    });
    a = window.location.hash.substr(1);
    if (0 < a.length) switch (a) {
    case "Groups":
        showGroups(!0);
        break;
    case "information":
        $.fancybox.open($("#information"), b);
        break;
    default:
        $GP.search.exactMatch = !0, $GP.search.search(a)
		$GP.search.clean();
    }

}

function Search(a) {
    this.input = a.find("input[name=search]");
    this.state = a.find(".state");
    this.results = a.find(".results");
    this.exactMatch = !1;
    this.lastSearch = "";
    this.searching = !1;
    var b = this;
    this.input.focus(function () {
        var a = $(this);
        a.data("focus") || (a.data("focus", !0), a.removeClass("empty"));
        b.clean()
    });
    this.input.keydown(function (a) {
        if (13 == a.which) return b.state.addClass("searching"), b.search(b.input.val()), !1
    });
    this.state.click(function () {
        var a = b.input.val();
        b.searching && a == b.lastSearch ? b.close() : (b.state.addClass("searching"), b.search(a))
    });
    this.dom = a;
    this.close = function () {
        this.state.removeClass("searching");
        this.results.hide();
        this.searching = !1;
        this.input.val("");//SAH -- let's erase string when we close
        nodeNormal()
    };
    this.clean = function () {
        this.results.empty().hide();
        this.state.removeClass("searching");
        this.input.val("");
    };
    this.search = function (a) {
        var b = !1,
            c = [],
            b = this.exactMatch ? ("^" + a + "$").toLowerCase() : a.toLowerCase(),
            g = RegExp(b);
        this.exactMatch = !1;
        this.searching = !0;
        this.lastSearch = a;
        this.results.empty();
        if (2 >= a.length) this.results.html("<i>You must search for a word with a minimum of 3 letters.</i>");
        else {
            sigInst.iterNodes(function (a) {
                g.test(a.label.toLowerCase()) && c.push({
                    id: a.id,
                    name: a.label
                })
            });
            c.length ? (b = !0, nodeActive(c[0].id)) : b = showCluster(a);
            a = ["<b>Search Results: </b>"];
            if (1 < c.length) for (var d = 0, h = c.length; d < h; d++) a.push('<a href="#' + c[d].name + '" onclick="nodeActive(\'' + c[d].id + "')\">" + c[d].name + "</a>");
            0 == c.length && !b && a.push("<i>No results found.</i>");
            1 < a.length && this.results.html(a.join(""));
           }
        if(c.length!=1) this.results.show();
        if(c.length==1) this.results.hide();   
    }
}

function Cluster(a) {
    this.cluster = a;
    this.display = !1;
    this.list = this.cluster.find(".list");
    this.list.empty();
    this.select = this.cluster.find(".select");
    this.select.click(function () {
        $GP.cluster.toggle()
    });
    this.toggle = function () {
        this.display ? this.hide() : this.show()
    };
    this.content = function (a) {
        this.list.html(a);
        this.list.find("a").click(function () {
            var a = $(this).attr("href").substr(1);
            showCluster(a)
        })
    };
    this.hide = function () {
        this.display = !1;
        this.list.hide();
        this.select.removeClass("close")
    };
    this.show = function () {
        this.display = !0;
        this.list.show();
        this.select.addClass("close")
    }
}
function showGroups(a) {
    a ? ($GP.intro.find("#showGroups").text("Hide groups"), $GP.bg.show(), $GP.bg2.hide(), $GP.showgroup = !0) : ($GP.intro.find("#showGroups").text("View Groups"), $GP.bg.hide(), $GP.bg2.show(), $GP.showgroup = !1)
}

function nodeNormal() {
    !0 != $GP.calculating && !1 != sigInst.detail && (showGroups(!1), $GP.calculating = !0, sigInst.detail = !0, $GP.info.delay(400).animate({width:'hide'},350),$GP.cluster.hide(), sigInst.iterEdges(function (a) {
        a.attr.color = !1;
        a.hidden = !1
    }), sigInst.iterNodes(function (a) {
        a.hidden = !1;
        a.attr.color = !1;
        a.attr.lineWidth = !1;
        a.attr.size = !1
    }), sigInst.draw(2, 2, 2, 2), sigInst.neighbors = {}, sigInst.active = !1, $GP.calculating = !1, window.location.hash = "")
}

function nodeActive(a) {
    var groupByDirection = false;
    if (config.informationPanel.groupByEdgeDirection && config.informationPanel.groupByEdgeDirection == true) groupByDirection = true;
    
    sigInst.neighbors = {};
    sigInst.detail = !0;
    var b = sigInst._core.graph.nodesIndex[a];
    showGroups(!1);
    var outgoing = {}, incoming = {}, mutual = {}; // SAH
    sigInst.iterEdges(function (b) {
        b.attr.lineWidth = !1;
        b.hidden = !0;
        
        var n = {
            name: b.label,
            colour: b.color
        };
        
        if (a == b.source) outgoing[b.target] = n; // SAH
        else if (a == b.target) incoming[b.source] = n; // SAH
        if (a == b.source || a == b.target) sigInst.neighbors[a == b.target ? b.source : b.target] = n;
        b.hidden = !1, b.attr.color = "rgba(0, 0, 0, 1)";
    });
    sigInst.iterNodes(function (a) {
        a.hidden = !0;
        a.attr.lineWidth = !1;
        a.attr.color = a.color;
    });
    
    if (groupByDirection) {
        for (var e in outgoing) {
            if (e in incoming) {
                mutual[e] = outgoing[e];
                delete incoming[e];
                delete outgoing[e];
            }
        }
    }
    
    var createAlphabeticalList = function (nodes) {
        var listItems = [];
        var sortedNodes = [];

        for (var key in nodes) {
            var node = sigInst._core.graph.nodesIndex[key];
            node.hidden = false;
            node.attr.lineWidth = false;
            node.attr.color = nodes[key].colour;

            if (a != key) {
                sortedNodes.push({
                    id: key,
                    name: node.label,
                    colour: nodes[key].colour
                });
            }
        }

        // Sort nodes alphabetically by their labels (names)
        sortedNodes.sort(function (n1, n2) {
            var name1 = n1.name.toLowerCase(),
                name2 = n2.name.toLowerCase();

            return name1 < name2 ? -1 : name1 > name2 ? 1 : 0;
        });

        // Generate HTML list items
        sortedNodes.forEach(function (node) {
            listItems.push('<li class="membership"><a href="#' + node.name + '" onmouseover="sigInst._core.plotter.drawHoverNode(sigInst._core.graph.nodesIndex[\'' + node.id + '\'])" onclick="nodeActive(\'' + node.id + '\')" onmouseout="sigInst.refresh()">' + node.name + "</a></li>");
        });

        return listItems;
    };
    
    var output = [];

    if (groupByDirection) {
        var size;

        size = Object.keys(mutual).length;
        output.push("<h2>Mutual (" + size + ")</h2>");
        output = output.concat(size > 0 ? createAlphabeticalList(mutual) : ["No mutual links<br>"]);

        size = Object.keys(incoming).length;
        output.push("<h2>Incoming (" + size + ")</h2>");
        output = output.concat(size > 0 ? createAlphabeticalList(incoming) : ["No incoming links<br>"]);

        size = Object.keys(outgoing).length;
        output.push("<h2>Outgoing (" + size + ")</h2>");
        output = output.concat(size > 0 ? createAlphabeticalList(outgoing) : ["No outgoing links<br>"]);
    } else {
        output = output.concat(createAlphabeticalList(sigInst.neighbors));
    }

    b.hidden = !1;
    b.attr.color = b.color;
    b.attr.lineWidth = 6;
    b.attr.strokeStyle = "#000000";
    sigInst.draw(2, 2, 2, 2);

    $GP.info_link.find("ul").html(output.join(""));
    $GP.info_link.find("li").each(function () {
        var a = $(this),
            b = a.attr("rel");
    });
    f = b.attr;
    if (f.attributes) {
        var image_attribute = false;
        if (config.informationPanel.imageAttribute) {
            image_attribute = config.informationPanel.imageAttribute;
        }
        var e = [];
        var temp_array = [];
        for (var attr in f.attributes) {
            var d = f.attributes[attr],
                h = "";
            if (attr != image_attribute) {
                h = '<span><strong>' + attr + ':</strong> ' + d + '</span><br/>';
            }
            e.push(h);
        }

        if (image_attribute) {
            $GP.info_name.html("<div><img src=" + f.attributes[image_attribute] + " style=\"vertical-align:middle\" /> <span onmouseover=\"sigInst._core.plotter.drawHoverNode(sigInst._core.graph.nodesIndex['" + b.id + '\'])" onmouseout="sigInst.refresh()">' + b.label + "</span></div>");
        } else {
            $GP.info_name.html("<div><span onmouseover=\"sigInst._core.plotter.drawHoverNode(sigInst._core.graph.nodesIndex['" + b.id + '\'])" onmouseout="sigInst.refresh()">' + b.label + "</span></div>");
        }

        $GP.info_data.html(e.join("<br/>"));
    }
    $GP.info_data.show();
    $GP.info_p.html("High frequency connections:");
    $GP.info.animate({width: 'show'}, 350);
    $GP.info_donnees.hide();
    $GP.info_donnees.show();
    sigInst.active = a;
    window.location.hash = b.label;
}

function showCluster(a) {
    var nodeIds = sigInst.clusters[a]; // Array of node IDs in the cluster
    if (nodeIds && nodeIds.length > 0) {
        showGroups(false);
        sigInst.detail = true;

        // Sort node IDs based on their labels
        nodeIds.sort(function(id1, id2) {
            var label1 = sigInst._core.graph.nodesIndex[id1].label;
            var label2 = sigInst._core.graph.nodesIndex[id2].label;
            return label1.localeCompare(label2);
        });

        // Show all edges
        sigInst.iterEdges(function(edge) {
            edge.hidden = false;
            edge.attr.lineWidth = false;
            edge.attr.color = false;
        });

        // Hide all nodes first
        sigInst.iterNodes(function(node) {
            node.hidden = true;
        });

        var htmlList = []; // For storing HTML list items
        var visibleNodeIds = []; // For storing IDs of nodes that will be shown

        // Iterate over sorted node IDs and update visibility
        for (var i = 0; i < nodeIds.length; i++) {
            var node = sigInst._core.graph.nodesIndex[nodeIds[i]];
            if (node.hidden) {
                visibleNodeIds.push(nodeIds[i]); // Collect node IDs to show
                node.hidden = false;
                node.attr.lineWidth = false;
                node.attr.color = node.color;
                // Create HTML list item
                htmlList.push('<li class="membership"><a href="#' + node.label + 
                    '" onmouseover="sigInst._core.plotter.drawHoverNode(sigInst._core.graph.nodesIndex[\'' + 
                    node.id + '"])\" onclick=\"nodeActive(\'' + node.id + 
                    '\')" onmouseout="sigInst.refresh()">' + node.label + "</a></li>");
            }
        }

        // Update cluster data
        sigInst.clusters[a] = visibleNodeIds;
        
        // Redraw the network visualization
        sigInst.draw(2, 2, 2, 2); // Ensure this is the correct way to trigger a redraw

        // Update UI elements
        $GP.info_name.html("<b>" + a + "</b>");
        $GP.info_data.hide();
        $GP.info_p.html("Group Members:");
        $GP.info_link.find("ul").html(htmlList.join(""));
        $GP.info.animate({width:'show'}, 350);
        $GP.search.clean();
        $GP.cluster.hide();
        
        return true;
    }
    return false;
}



