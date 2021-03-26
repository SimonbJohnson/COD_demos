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
		$('#'+tableID).append(html);
		row.forEach(function(d,j){
			let value = d;
			if(limit==true){
				if(d.length>20){
					value = d.substr(0,17)+'...';
				}
			}
			let html = '<td id="'+rowID+'cell'+j+'">'+value+'</td>';
			$('#'+rowID).append(html);
		});
	});
}

/// demo 1 

function initDemo1(){
	$('#demo1countrypicker').on('change',function(d){
		let country = $('#demo1countrypicker').val();
		let url = 'https://beta.itos.uga.edu/CODV2API/api/v1/Themes/cod-ab/Lookup/Get?level=1&countryPCode='+country;
		$.ajax({ 
		    type: 'GET', 
		    url: url, 
		    dataType: 'json',
		    success:function(response){
		    	$('#demo1adminpicker').html('<option>Pick an Admin area</option>');
		    	response.forEach(function(d){
		    		$('#demo1adminpicker').append('<option value="'+d['admin1Pcode']+'">'+d['admin1Name_local']+'</option>');
		    	});
		    }
		});			
	});

	$('#demo1adminpicker').on('change',function(){
		let value = $('#demo1adminpicker').val();
		$('#demo1value').html('PCode: '+value);
	});
}

/// demo 2

var demo2Data = [
	["start", "end", "Choose_sector", "Organisation_name", "People_reached","lat","lng","_id", "_uuid", "_submission_time","Admin 1 name","Admin 1 code","Admin 2 name","Admin 2 code"],
	["", "", "#sector", "#org", "#reached", "#geo+lat", "#geo+lon", "", "","", "#adm1+name","#adm1+code","#adm2+name","#adm2+code"],
	["2020-07-24T14:10:04.600+01:00", "2020-07-24T14:10:22.560+01:00", "health", "BRC", "20000",95.55,46.29, "112850970", "7d6a83f7-0137-4a68-95b5-aa30cd833be1", "2020-07-24T13:10:32","","","",""],
	["2020-07-24T14:10:22.612+01:00", "2020-07-24T14:10:45.978+01:00", "shelther", "BRC", "50000",109.94,44.89, "112851009", "e8e0f6b7-6d4c-42f4-a7bb-58d8b9eb7e8e", "2020-07-24T13:10:56","","","",""],
	["2020-07-24T14:10:46.027+01:00", "2020-07-24T14:11:08.345+01:00", "health", "ARC", "10000",112.90,47.81, "112851071", "b7c6e3ff-87c7-4d82-b2f4-0012a63e046c", "2020-07-24T13:11:19","","","",""]
]

function initDemo2(data){
	createTableFromHXL('demo2data',data,true);
	$('#pcodedata').on('click',function(){
		data.forEach(function(d,i){
			if(i>1){
				let lat = d[5];
				let lon = d[6];
				getAdmin(lat,lon,i);
			}
		});
	});
}

function getAdmin(lat,lon,row){

	let url = 'https://beta.itos.uga.edu/CODV2API/api/v1/Themes/cod-ab/Lookup/latlng?latlong={{lat}},{{lon}}&wkid=4326&level=2';
	
	url = url.replace('{{lat}}',lat);
	url = url.replace('{{lon}}',lon);

	console.log(url);
	$.ajax({ 
	    type: 'GET', 
	    url: url, 
	    dataType: 'json',
	    success:function(response){
	    	updateTable(response,row);
	    }
	});	
}

function updateTable(response,row){
	let updates = [
		{'source':'admin1Name_local','target':'demo2datarow{{row}}cell10'},
		{'source':'admin2Name_local','target':'demo2datarow{{row}}cell12'},
		{'source':'admin1Pcode','target':'demo2datarow{{row}}cell11'},
		{'source':'admin2Pcode','target':'demo2datarow{{row}}cell13'},
	];

	updates.forEach(function(d){
		let target = '#'+d.target.replace('{{row}}',row);
		let value = response[0][d.source];
		$(target).html(value);
	});
}

//demo3

function initDemo3(data){
	$('#loaddata3').on('click',function(){
		let url = $('#userfile').val();
		loadDemo3Data(url);
	});
}

function mapcreate3(data){

	if(map3!=false){
		map3.off();
		map3.remove();
	}
	map3 = L.map('map3').setView([48.29,102.55], 5); // africa

	L.tileLayer('http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	  maxZoom: 18,
	  id: 'examples.map-i86knfo3'
	}).addTo(map3);

	console.log(data)
	var mapTiles = L.vectorGrid.protobuf("http://beta.itos.uga.edu/CODV2API/api/v1/Themes/cod-ab/locations/MNG/versions/current/1/{z}/{x}/{y}.pbf", {
		vectorTileLayerStyles: {
			    'PROJ_LIB':function(properties) {
			    	console.log(properties);
			    	let value = data[properties['admin1pcode']];
			    	color = '#ffffff'
			    	if(value == undefined){
			    		console.log(properties['admin1pcode']);
			    	}
			    	if(value>100){
			    		color = '#EF9A9A'
			    	}
			    	if(value>500){
			    		color = '#E53935'
			    	}
			    	if(value>1000){
			    		color = '#B71C1C'
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
	}).addTo(map3);
}

function loadDemo3Data(url){
	let dataURL = 'https://proxy.hxlstandard.org/data.json?dest=data_edit&filter01=count&count-tags01=%23adm1%2Bcode&count-type01-01=sum&count-pattern01-01=%23affected&count-header01-01=Count&count-column01-01=%23meta%2Bcount&strip-headers=on&url='+url

	$.ajax({ 
	    type: 'GET', 
	    url: dataURL,
	    dataType: 'json',
	    success:function(response){
	    	let data = processData(response);
	    	mapcreate3(data);
	    }
	});	
}

//demo 4

function initDemo4(data){
	loadDemo4Data();
}

function map4(data){
	var map = L.map('map4').setView([12,-1.5], 6); // africa

	L.tileLayer('http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	  maxZoom: 18,
	  id: 'examples.map-i86knfo3'
	}).addTo(map);


	var mapTiles = L.vectorGrid.protobuf("https://itos-humanitarian.s3.amazonaws.com/v1/VectorTile/COD_MON/Admin1/{z}/{x}/{y}.pbf", {
		vectorTileLayerStyles: {
			    'Admin2':function(properties) {
			    	let value = data[properties['admin1Pcode']];
			    	color = '#ffffff'
			    	if(value == undefined){
			    		console.log(properties['admin1Pcode']);
			    	}
			    	if(value>0){
			    		color = '#90CAF9'
			    	}
			    	if(value>5){
			    		color = '#42A5F5'
			    	}
			    	if(value>10){
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
	let dataURL = 'https://proxy.hxlstandard.org/data.json?dest=data_edit&filter01=cut&filter-label01=Cut+unneeded+columns&cut-include-tags01=%23adm2%2Bcode%2C%23org%2Bname&filter02=dedup&filter-label02=remove+duplicate+for+unique+count+of+orgs&dedup-tags02=%23org%2C%23adm2&filter03=count&filter-label03=Aggregate+count+per+adm2&count-tags03=%23adm2%2Bcode&count-type03-01=count&count-header03-01=Count&count-column03-01=%23meta%2Bcount&strip-headers=on&url=https%3A%2F%2Fdata.humdata.org%2Fdataset%2Fburkina-faso-presence-operationnelle'

	$.ajax({ 
	    type: 'GET', 
	    url: dataURL,
	    dataType: 'json',
	    success:function(response){
	    	let data = processData(response);
	    	console.log(response);
	    	map4(data);
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

var map3 = false;

initDemo1();
initDemo2(demo2Data);
initDemo3();
//initDemo4();
