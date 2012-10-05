
$api = CreateAPI('podio');
$api.GET('space','podio-bot', null, function(space){
	space.GET('app','task-apps', null, function(taskApps){
		taskApps.GET('app-items', function(metaTaskApps){
			var metaTaskApp;
			for(var i=0;i<metaTaskApps.length;i++){
				metaTaskApp = space.GET('app-item', metaTaskApps[i].ID, function(taskApps){});
				$api.out("<p>Task Apps: "+metaTaskApp.title+"</p>");
			}
		});
	});
});
