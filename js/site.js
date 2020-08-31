function loadData(url){
	$.ajax({ 
	    type: 'GET', 
	    url: url, 
	    dataType: 'json',
	    success:function(response){
	        let data = hxlProxyToJSON(response);
	        init(data);
	    }
	});
}

function hxlProxyToJSON(input){
    var output = [];
    var keys=[]
    input.forEach(function(e,i){
        if(i==0){
            e.forEach(function(e2,i2){
                var parts = e2.split('+');
                var key = parts[0]
                if(parts.length>1){
                    var atts = parts.splice(1,parts.length);
                    atts.sort();                    
                    atts.forEach(function(att){
                        key +='+'+att
                    });
                }
                keys.push(key);
            });
        } else {
            var row = {};
            e.forEach(function(e2,i2){
                row[keys[i2]] = e2;
            });
            output.push(row);
        }
    });
    return output;
}

function createTableFromHXL(id,data,limit=false){
	$('#'+id).html('<table id="'+id+'table"></table>');
	let tableID = id+'table';
	console.log(tableID);
	data.forEach(function(row,i){
		console.log(row);
		let clss="datarow"
		if(i==0){
			clss="headerrow"
		}
		if(i==1){
			clss="hxlrow"
		}
		let rowID = id + 'row' + i
		let html = '<tr id="'+rowID+'" class="'+clss+'"></tr>';
		console.log(html);
		$('#'+tableID).append(html);
		row.forEach(function(d,i){
			let value = d;
			if(limit==true){
				if(d.length>20){
					value = d.substr(0,17)+'...';
				}
			}
			let html = '<td>'+value+'</td>';
			$('#'+rowID).append(html);
		});
	});
}


/// demo 2

var demo2Data = [
["start", "end", "Choose_sector", "Organisation_name", "People_reached","lat","lng","_id", "_uuid", "_submission_time","Admin 1 name","Admin 1 code","Admin 2 name","Admin 2 code","Admin 3 name","Admin 3 code"],
["", "", "#sector", "#org", "#reached", "#geo+lat", "#geo+lon", "", "","", "#adm1+name","#adm1+code","#adm2+name","#adm2+code","#adm3+name","#adm3+code"],
["2020-07-24T14:10:04.600+01:00", "2020-07-24T14:10:22.560+01:00", "health", "BRC", "20000","0","0", "112850970", "7d6a83f7-0137-4a68-95b5-aa30cd833be1", "2020-07-24T13:10:32","","","","","",""],
["2020-07-24T14:10:22.612+01:00", "2020-07-24T14:10:45.978+01:00", "shelther", "BRC", "50000","0","0", "112851009", "e8e0f6b7-6d4c-42f4-a7bb-58d8b9eb7e8e", "2020-07-24T13:10:56","","","","","",""],
["2020-07-24T14:10:46.027+01:00", "2020-07-24T14:11:08.345+01:00", "health", "ARC", "10000","0","0", "112851071", "b7c6e3ff-87c7-4d82-b2f4-0012a63e046c", "2020-07-24T13:11:19","","","","","",""]
]

function initDemo2(data){
	createTableFromHXL('demo2data',data,true);
}

//demo 4

function initDemo4(data){
	loadDemo4Data();
}

function map(data){
	var map = L.map('map4').setView([12,-1.5], 6); // africa

	L.tileLayer('http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	  maxZoom: 18,
	  id: 'examples.map-i86knfo3'
	}).addTo(map);


	var mapTiles = L.vectorGrid.protobuf("https://itos-humanitarian.s3.amazonaws.com/v1/VectorTile/COD_BFA/Admin1/{z}/{x}/{y}.pbf", {
		vectorTileLayerStyles: {
			    'Admin1':function(properties) {
			    	let value = data[properties['admin1Pcode']];
			    	color = '#ffffff'
			    	if(value == undefined){
			    		console.log(properties['admin1Pcode']);
			    	}
			    	if(value>0){
			    		color = '#90CAF9'
			    	}
			    	if(value>10){
			    		color = '#42A5F5'
			    	}
			    	if(value>100){
			    		color = '#0D47A1'
			    	}
			    	return {
				        weight: 2,
				        fill: '#9bc2c4',
				        color: color,
				        dashArray: '3',
				        fillOpacity: 0.7
				    }
			    }
		}
	}).addTo(map);
}

function loadDemo4Data(){
	let dataURL = 'https://proxy.hxlstandard.org/data.json?dest=data_edit&filter01=count&count-tags01=%23adm1%2Bcode&count-type01-01=count&count-header01-01=Count&count-column01-01=%23meta%2Bcount&strip-headers=on&url=https%3A%2F%2Fdata.humdata.org%2Fdataset%2Fburkina-faso-presence-operationnelle'

	$.ajax({ 
	    type: 'GET', 
	    url: dataURL,
	    dataType: 'json',
	    success:function(response){
	    	let data = processData(response);
	    	map(data);
	    }
	});	
}

function processData(data){
	output = {}
	data.forEach(function(d,i){
		if(i>1){
			output[d[0]] = d[1];
		}
	});
	return output;
}


//inits

initDemo2(demo2Data);
initDemo4();
