// This is a FourSquare Get Categories API
$api.GET('venue-categories',function(data){
	var category, categories = {};
	for(var i=0; i<data.response.categories.length; i++){
		category = data.response.categories[i];
		categories[category.id] = category.name;
	}
	$api.out( categories );
});

