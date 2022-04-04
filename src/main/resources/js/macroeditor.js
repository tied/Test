
//Macro panel buttons , remove edit button.
AJS.Confluence.PropertyPanel.Macro.registerInitHandler(function(macroPlaceholder, buttons) {
 buttons[0].html = '<i></i>';
 $(window).once('created.property-panel', function () {
//Incase of event handler required.
});
}, 'prolaborate');

AJS.toInit(function () {
	try {
		var $pageMetadata = AJS.$('#content.page.view .page-metadata:first');

		//Load template for Custom dialog.
		var template = Confluence.Templates.SoyTutorial.listSelectedAjsParams();
		AJS.$('body').append(template);

		AJS.tabs.setup();

		getProlaborateConnection();
		//getProlaborateDiagramStereotypes("");
		//getProlaborateElementStereotypes("");
		//getProlaborateRepositories("");
		var url = AJS.contextPath() + "/rest/prolaborate-admin/1.0/";
		$.ajax({
			url: url,
			dataType: "json"
		}).done(function (config) { // when the configuration is returned...

			if (typeof (config) != "undefined" && typeof (config.protocol) != "undefined" && typeof (config.server) != "undefined" && config.protocol != "" && config.server != "") {
				//getProlaborateRepositories(config.repositoryId);
				CurrentRepository = config.repositoryId;
				RepositoryIdsList = config.repositoryIdsList;
				getProlaborateRepositories(CurrentRepository);
			}
		});

		AJS.$(function () {
			AJS.$(document.body).on('keypress', '#diagram-name', function (e) {
				var key = e.keyCode;
				if (key == 13) {
					return false;
				}
			});
			AJS.$(document.body).on('keypress', '#package-name', function (e) {
				var key = e.keyCode;
				if (key == 13) {
					return false;
				}
			});
			AJS.$(document.body).on('keypress', '#element-name', function (e) {
				var key = e.keyCode;
				if (key == 13) {
					return false;
				}
			});
		});
	}
	catch (e) {
		//alert(e);
	}

});

var ConnectionStatus="fail";
var CurrentRepository="";
var RepositoryIdsList = "";
var LicenseError = "Not able to connect to Prolaborate server. Please check and try again.";

function retainMacroData(MacroData) {
	switch (MacroData.Type) {
		case "Diagram":
			$("a[href=\"#tabs-example-first\"]").trigger("click");
			if (typeof (MacroData.ShowChildren) != "undefined" && MacroData.ShowChildren != null && MacroData.ShowChildren != "") {
				var checkBox = $("#showDiagramObjects")[0];
				CheckAndUncheck_CheckBox(checkBox, MacroData.ShowChildren);			
			}
			if (typeof (MacroData.EnableLink) != "undefined" && MacroData.EnableLink != null && MacroData.EnableLink != "") {
				var checkBox = $("#enableDiagramLink")[0];
				CheckAndUncheck_CheckBox(checkBox, MacroData.EnableLink);
			}
			if (typeof (MacroData.EnablePath) != "undefined" && MacroData.EnablePath != null && MacroData.EnablePath != "") {
				var checkBox = $("#enableDiagramPath")[0];
				CheckAndUncheck_CheckBox(checkBox, MacroData.EnablePath);
			}
			if (typeof (MacroData.EnableBorder) != "undefined" && MacroData.EnableBorder != null && MacroData.EnableBorder != "") {
				var checkBox = $("#enableDiagramBorder")[0];
				CheckAndUncheck_CheckBox(checkBox, MacroData.EnableBorder);
			}
			LoadExistingDiagram_List(MacroData.Name, "{" + MacroData.Guid + "}");
			break;
		case "Package":
			$("a[href=\"#tabs-example-second\"]").trigger("click");
			if (typeof (MacroData.ShowChildren) != "undefined" && MacroData.ShowChildren != null && MacroData.ShowChildren != "") {
				var checkBox = $("#showPackageChildren")[0];
				CheckAndUncheck_CheckBox(checkBox, MacroData.ShowChildren);
			}
			if (typeof (MacroData.EnableLink) != "undefined" && MacroData.EnableLink != null && MacroData.EnableLink != "") {
				var checkBox = $("#enablePackageChildLink")[0];
				CheckAndUncheck_CheckBox(checkBox, MacroData.EnableLink);
			}
			if (typeof (MacroData.EnablePath) != "undefined" && MacroData.EnablePath != null && MacroData.EnablePath != "") {
				var checkBox = $("#enablePackagePath")[0];
				CheckAndUncheck_CheckBox(checkBox, MacroData.EnablePath);
			}
			if (typeof (MacroData.EnableBorder) != "undefined" && MacroData.EnableBorder != null && MacroData.EnableBorder != "") {
				var checkBox = $("#enablePackageBorder")[0];
				CheckAndUncheck_CheckBox(checkBox, MacroData.EnableBorder);
			}			
			LoadExistingPackage_List(MacroData.Name, "{" + MacroData.Guid + "}");
			break;
		case "Element":
			$("a[href=\"#tabs-example-third\"]").trigger("click");
			if (typeof (MacroData.ShowChildren) != "undefined" && MacroData.ShowChildren != null && MacroData.ShowChildren != "") {
				var checkBox = $("#showElementChildren")[0];
				CheckAndUncheck_CheckBox(checkBox, MacroData.ShowChildren);
			}
			if (typeof (MacroData.EnableLink) != "undefined" && MacroData.EnableLink != null && MacroData.EnableLink != "") {
				var checkBox = $("#enableElementChildLink")[0];
				CheckAndUncheck_CheckBox(checkBox, MacroData.EnableLink);
			}
			if (typeof (MacroData.EnablePath) != "undefined" && MacroData.EnablePath != null && MacroData.EnablePath != "") {
				$("#enableElementPath").checked = true;
				var checkBox = $("#enableElementPath")[0];
				CheckAndUncheck_CheckBox(checkBox, MacroData.EnablePath);
			}
			if (typeof (MacroData.EnableBorder) != "undefined" && MacroData.EnableBorder != null && MacroData.EnableBorder != "") {
				var checkBox = $("#enableElementBorder")[0];
				CheckAndUncheck_CheckBox(checkBox, MacroData.EnableBorder);
			}	
			LoadExistingElement_List(MacroData.Name, "{" + MacroData.Guid + "}");
			break;
	}
}

function CheckAndUncheck_CheckBox(element,IsChecked) {
	if (IsChecked == "0") {
		if (element.checked == true) {
			element.checked = false;
		}
	} else {
		if (element.checked == false) {
			element.checked = true;
		}
	}
}

function LoadExistingDiagram_List(DiagramName, Guid) {
	$('.info-wrap-diagram').remove();
	$('.Diag-count').hide();
	$('#Diag-Detail').hide();
	$('.diag-loader').show();
	$('#diagram-filter-item').html("");//Reset List	
	$('.diag-more').hide();

	repositoryId = $("#repository").val();
	var url1 = AJS.contextPath() + "/rest/prolaborate-admin/1.0/ProlabDiagramsList";
	AJS.$.ajax({
		url: url1,
		type: "POST",
		data: '{"repositoryId":"' + repositoryId + '", "DiagramName": "' + DiagramName + '", "Author":"", "DiagramType": "' + "" + '", "Stereotype":"' + "" + '", "StartIndex":0}',
		dataType: "json",
		contentType: "application/json"
	}).done(function (response) { // when the configuration is returned...

		$("#repository").prop('disabled', false);

		if (typeof (response) != "undefined" && response != null && response.d.status == "success") {
			if (response.d.DiagramCount > 0) {
				$('#totalCount').text("1");
				$('#offsetCount').text("1");


				$('.Diag-count').show();

				if ($('#totalCount').text() == $('#offsetCount').text()) {
					$('.diag-more').hide();
				}
				else { $('.diag-more').show(); }

				var DiagramStreoTypesJSON = response.d.DiagramList;

				$.each(DiagramStreoTypesJSON, function (i, value) {

					if (value.Guid != Guid)
						return;
					var FQPath = '';
					var name = ""
					if (value.Name == "")
						name = "&nbsp;";
					else
						name = escapeHtml(value.Name);//Esacape Html content -DJ
					var arrow = '<i class="aui-icon aui-icon-small aui-iconfont-arrow-down-small"></i>';
					if (value.PackageQualifiedName != '') { FQPath = replaceAll(escapeHtml(value.PackageQualifiedName), '-&gt;', arrow); }//Esacape Html content -DJ
					if (value.ElementQualifiedName != '') {
						FQPath += arrow;
						FQPath += replaceAll(escapeHtml(value.ElementQualifiedName), '-&gt;', arrow);//Esacape Html content -DJ
					}
					if (value.PackageQualifiedName == '' & value.ElementQualifiedName == '') {
						arrow = '';
					}
					FQPath += arrow + escapeHtml(value.Name);//Esacape Html content -DJ
					//Generate
					var itemDiagram = $(

						'<li id="diag_' + value.Guid + '" class ="DiagListItem"> ' +
						' <div class="filter-item-wrap diagramItem dialog-active" data-guid="' + value.Guid + '">' +
						'<span class="icon-thumb icon-diagram"></span>' +
						'<div class="list-content"><p class="item-name">' + name + '</p> <p class="item-author"><span class="aui-icon aui-icon-small aui-iconfont-person"></span> ' + value.Author + ' </p> </div>' +
						'<span class="selected">Selected</span> ' +
						'</div>' +
						' <button class="item-info aui-icon aui-icon-small aui-iconfont-info-filled" data-aui-trigger aria-controls="pop_' + value.Guid + '">Click me</button>' +
						'<aui-inline-dialog id="pop_' + value.Guid + '" class="info-wrap info-wrap-diagram">' +
						'<ul class="info-details"> ' +
						'<li>' +
						'<p class="text-label">Name:</p><p class="label-info">' + value.Name + '</p> ' +
						'</li>' +
						'<li>' +
						'<p class="text-label">Path:</p> <p class="label-info">' + FQPath + ' </p> ' +
						'</li>' +
						'<li>' +
						'<p class="text-label">Stereotype:</p><p class="label-info">' + value.Stereotype + '</p> ' +
						'</li>' +
						'<li>' +
						'<p class="text-label">Author:</p><p class="label-info">' + value.Author + '</p> ' +
						'</li>' +
						'<li>' +
						'<p class="text-label">Last Modified:</p><p class="label-info">' + moment(value.Modified).format("DD/MM/YYYY") + '</p> ' +
						'</li>' +
						'<ul> ' +
						'</aui-inline-dialog> ');
					$('#diagram-filter-item').append(itemDiagram);

				});
			}
			else {
				$('.Diag-count').hide();
				var NoResult = '<div class="no-result"><figure class="graphy-nosearch"></figure><h3>No Results</h3><p>We searched far and wide but couldn’t find any objects matching your search. Learn more <a href=\"https://prolaborate.sparxsystems.com/faq/confluence-integration/using-the-macro#no-results-in-confluence-macro \" target=\"_blank\">here</a></p></div>'
				$('#diagram-filter-item').append(NoResult);
			}

			$('.diag-loader').hide();
		}
		else {
			$('.diag-loader').hide();
			$('.Diag-count').hide();
			var NoResult = '<div class="no-result"><figure class="graphy-nosearch"></figure><h3>Unable to connect to Prolaborate</h3><p>It looks like some settings or licenses have been changed in Prolaborate after it was configured in Confluence. Please check Prolaborate configuration. Learn more <a href=\"https://prolaborate.sparxsystems.com/faq/confluence-integration/using-the-macro#unauthorized-request-or-authentication-failed \" target=\"_blank\">here</a></p></div>';
			$('#diagram-filter-item').append(NoResult);
		}
	}).fail(function () {
		$("#repository").prop('disabled', false);
		$('.diag-loader').hide();
		$('.Diag-count').hide();
		var NoResult = '<div class="no-result"><figure class="graphy-nosearch"></figure><h3>Unable to connect to Prolaborate</h3><p>It looks like some settings or licenses have been changed in Prolaborate after it was configured in Confluence. Please check Prolaborate configuration. Learn more <a href=\"https://prolaborate.sparxsystems.com/faq/confluence-integration/using-the-macro#unauthorized-request-or-authentication-failed \" target=\"_blank\">here</a></p></div>';
		$('#diagram-filter-item').append(NoResult);
	});
}

function LoadExistingPackage_List(PackageName, Guid) {
	$('.info-wrap-package').remove();
	$('.pkg-count').hide();
	$('#Pkg-Detail').hide();
	$('.pkg-loader').show();
	$('#package-filter-item').html("");//Reset List	
	$('.pkg-more').hide();

	repositoryId = $("#repository").val();

	var url1 = AJS.contextPath() + "/rest/prolaborate-admin/1.0/ProlabPackageList";
	AJS.$.ajax({
		url: url1,
		type: "POST",
		data: '{"repositoryId":"' + repositoryId + '", "PackageName": "' + PackageName + '", "Author":"", "StartIndex":0}',
		dataType: "json",
		contentType: "application/json"
	}).done(function (response) { // when the configuration is returned...

		$("#repository").prop('disabled', false);

		if (typeof (response) != "undefined" && response != null && response.d.status == "success") {
			if (response.d.PackageCount > 0) {
				$('#pkgTotalCount').text("1");
				$('#pkgOffsetCount').text("1");

				$('.pkg-more').show();
				$('.pkg-count').show();

				if ($('#pkgTotalCount').text() == $('#pkgOffsetCount').text()) { $('.pkg-more').hide(); }
				else { $('.pkg-more').show(); }

				var PackagesJSON = response.d.Packages;

				$.each(PackagesJSON, function (i, value) {
					if (value.Guid != Guid)
						return;
					var FQPath = '';
					var name = ""
					if (value.Name == "")
						name = "&nbsp;";
					else
						name = escapeHtml(value.Name);//Esacape Html content -DJ
					var arrow = '<i class="aui-icon aui-icon-small aui-iconfont-arrow-down-small"></i>';
					if (value.PackageQualifiedName != '') { FQPath = replaceAll(escapeHtml(value.PackageQualifiedName), '-&gt;', arrow); }//Esacape Html content -DJ
					if (value.ElementQualifiedName != '') {
						FQPath += arrow;
						FQPath += replaceAll(escapeHtml(value.ElementQualifiedName), '-&gt;', arrow);//Esacape Html content -DJ
					}
					if (value.PackageQualifiedName == '' & value.ElementQualifiedName == '') {
						arrow = '';
					}
					//FQPath +=arrow+value.Name;
					//Generate
					//console.log(value);
					var itemPackage = $(

						'<li id="pkg_' + value.Guid + '" class ="PkgListItem"> ' +
						' <div class="filter-item-wrap packageItem dialog-active" data-guid="' + value.Guid + '">' +
						'<span class="icon-thumb icon-folder"></span>' +
						'<div class="list-content"> <p class="item-name">' + name + '</p> <p class="item-author"><span class="aui-icon aui-icon-small aui-iconfont-person"></span>' + value.Author + '</p></div>' + '<span class="selected">Selected</span>' +
						'</div>' +
						' <button class="item-info aui-icon aui-icon-small aui-iconfont-info-filled" data-aui-trigger aria-controls="pop_' + value.Guid + '">Click me</button>' +
						'<aui-inline-dialog id="pop_' + value.Guid + '" class="info-wrap info-wrap-package">' +
						'<ul class="info-details"> ' +
						'<li>' +
						'<p class="text-label">Name:</p><p class="label-info">' + name + '</p> ' +
						'</li>' +
						'<li>' +
						'<p class="text-label">Path:</p> <p class="label-info">' + FQPath + ' </p> ' +
						'</li>' +
						'<li>' +
						'<p class="text-label">Author:</p><p class="label-info">' + value.Author + '</p> ' +
						'</li>' +
						'<li>' +
						'<p class="text-label">Last Modified:</p><p class="label-info">' + moment(value.Modified).format("DD/MM/YYYY") + '</p> ' +
						'</li>' +
						'<ul> ' +
						'</aui-inline-dialog> ');
					$('#package-filter-item').append(itemPackage);

				});
			}
			else {
				$('.pkg-count').hide();
				var NoResult = '<div class="no-result"><figure class="graphy-nosearch"></figure><h3>No Results</h3><p>We searched far and wide but couldn’t find any objects matching your search. Learn more <a href=\"https://prolaborate.sparxsystems.com/faq/confluence-integration/using-the-macro#no-results-in-confluence-macro \" target=\"_blank\">here</a></p></div>'
				$('#package-filter-item').append(NoResult);
			}
			$('.pkg-loader').hide();
		}

		else {
			$('.pkg-count').hide();
			$('.pkg-loader').hide();
			var NoResult = '<div class="no-result"><figure class="graphy-nosearch"></figure><h3>Unable to connect to Prolaborate</h3><p>It looks like some settings or licenses have been changed in Prolaborate after it was configured in Confluence. Please check Prolaborate configuration. Learn more <a href=\"https://prolaborate.sparxsystems.com/faq/confluence-integration/using-the-macro#unauthorized-request-or-authentication-failed \" target=\"_blank\">here</a></p></div>';
			$('#package-filter-item').append(NoResult);
		}
	}).fail(function () {
		$("#repository").prop('disabled', false);
		$('.pkg-count').hide();
		$('.pkg-loader').hide();
		var NoResult = '<div class="no-result"><figure class="graphy-nosearch"></figure><h3>Unable to connect to Prolaborate</h3><p>It looks like some settings or licenses have been changed in Prolaborate after it was configured in Confluence. Please check Prolaborate configuration. Learn more <a href=\"https://prolaborate.sparxsystems.com/faq/confluence-integration/using-the-macro#unauthorized-request-or-authentication-failed \" target=\"_blank\">here</a></p></div>';
		$('#package-filter-item').append(NoResult);
	});
}

function LoadExistingElement_List(ElementName, Guid) {
	$('.info-wrap-element').remove();
	$('.Elm-count').hide();
	$('#Elm-Detail').hide();
	$('.Elm-loader').show();
	$('#element-filter-item').html("");//Reset List	
	$('.Elm-more').hide();

	ElementStreotype = $("#element-stereo-type").val();
	repositoryId = $("#repository").val();

	var url1 = AJS.contextPath() + "/rest/prolaborate-admin/1.0/ProlabElementList";
	AJS.$.ajax({
		url: url1,
		type: "POST",
		data: '{"repositoryId":"' + repositoryId + '", "ElementName": "' + ElementName + '", "Author":"", "ElementType": "' + "" + '", "Stereotype":"' + "" + '", "StartIndex":0}',
		dataType: "json",
		contentType: "application/json"
	}).done(function (response) { // when the configuration is returned...

		$("#repository").prop('disabled', false);

		if (typeof (response) != "undefined" && response != null && response.d.status == "success") {
			if (response.d.ElementCount > 0) {
				$('#ElmTotalCount').text("1");
				$('#ElmOffsetCount').text("1");


				$('.Elm-count').show();

				$('.Diag-count').show();
				$('#Diag-Detail').hide();

				if ($('#ElmTotalCount').text() == $('#ElmOffsetCount').text()) {
					$('.Elm-more').hide();
				}
				else { $('.Elm-more').show(); }

				var ElementsJSON = response.d.Elements;

				$.each(ElementsJSON, function (i, value) {
					if (value.Guid != Guid)
						return;
					var FQPath = '';
					var name = ""
					if (value.Name == "")
						name = "&nbsp;";
					else
						name = escapeHtml(value.Name);//Esacape Html content -DJ
					var arrow = '<i class="aui-icon aui-icon-small aui-iconfont-arrow-down-small"></i>';
					if (value.PackageQualifiedName != '') { FQPath = replaceAll(escapeHtml(value.PackageQualifiedName), '-&gt;', arrow); }//Esacape Html content -DJ
					if (value.ElementQualifiedName != '') {
						FQPath += arrow;
						FQPath += replaceAll(escapeHtml(value.ElementQualifiedName), '-&gt;', arrow);//Esacape Html content -DJ
					}
					if (value.PackageQualifiedName == '' & value.ElementQualifiedName == '') {
						arrow = '';
					}
					FQPath += arrow + escapeHtml(value.Name);//Esacape Html content -DJ
					//Generate
					var itemElement = $(

						'<li id="pkg_' + value.Guid + '" class ="ElmListItem"> ' +
						' <div class="filter-item-wrap elementItem dialog-active" data-guid="' + value.Guid + '">' +
						'<span class="icon-thumb icon-element"></span>' +
						'<div class="list-content"><p class="item-name">' + name + '</p> <p class="item-author"><span class="aui-icon aui-icon-small aui-iconfont-person"></span> ' + value.Author + ' </p> </div>' +
						'<span class="selected">Selected</span> ' +
						'</div>' +
						' <button class="item-info aui-icon aui-icon-small aui-iconfont-info-filled" data-aui-trigger aria-controls="pop_' + value.Guid + '">Click me</button>' +
						'<aui-inline-dialog id="pop_' + value.Guid + '" class="info-wrap info-wrap-element">' +
						'<ul class="info-details"> ' +
						'<li>' +
						'<p class="text-label">Name:</p><p class="label-info">' + name + '</p> ' +
						'</li>' +
						'<li>' +
						'<p class="text-label">Path:</p> <p class="label-info">' + FQPath + ' </p> ' +
						'</li>' +
						'<li>' +
						'<p class="text-label">Stereotype:</p><p class="label-info">' + value.Stereotype + '</p> ' +
						'</li>' +
						'<li>' +
						'<p class="text-label">Author:</p><p class="label-info">' + value.Author + '</p> ' +
						'</li>' +
						'<li>' +
						'<p class="text-label">Last Modified:</p><p class="label-info">' + moment(value.Modified).format("DD/MM/YYYY") + '</p> ' +
						'</li>' +
						'<ul> ' +
						'</aui-inline-dialog> ');
					$('#element-filter-item').append(itemElement);

				});
			}
			else {
				$('.Elm-count').hide();
				var NoResult = '<div class="no-result"><figure class="graphy-nosearch"></figure><h3>No Results</h3><p>We searched far and wide but couldn’t find any objects matching your search. Learn more <a href=\"https://prolaborate.sparxsystems.com/faq/confluence-integration/using-the-macro#no-results-in-confluence-macro \" target=\"_blank\">here</a></p></div>'
				$('#element-filter-item').append(NoResult);
			}
			$('.Elm-loader').hide();
		}
		else {
			$('.Elm-count').hide();
			$('.Elm-loader').hide();
			var NoResult = '<div class="no-result"><figure class="graphy-nosearch"></figure><h3>Unable to connect to Prolaborate</h3><p>It looks like some settings or licenses have been changed in Prolaborate after it was configured in Confluence. Please check Prolaborate configuration. Learn more <a href=\"https://prolaborate.sparxsystems.com/faq/confluence-integration/using-the-macro#unauthorized-request-or-authentication-failed \" target=\"_blank\">here</a></p></div>';
			$('#element-filter-item').append(NoResult);
		}
	}).fail(function () {
		$("#repository").prop('disabled', false);
		$('.Elm-count').hide();
		$('.Elm-loader').hide();
		var NoResult = '<div class="no-result"><figure class="graphy-nosearch"></figure><h3>Unable to connect to Prolaborate</h3><p>It looks like some settings or licenses have been changed in Prolaborate after it was configured in Confluence. Please check Prolaborate configuration. Learn more <a href=\"https://prolaborate.sparxsystems.com/faq/confluence-integration/using-the-macro#unauthorized-request-or-authentication-failed \" target=\"_blank\">here</a></p></div>';
		$('#element-filter-item').append(NoResult);
	});
}

AJS.bind("init.rte", function () {

	var macroName = 'prolaborate';

	try {
		//To Override default macro editor dialog.
		AJS.MacroBrowser.setMacroJsOverride('prolaborate', {
			opener: function (macro) {
				var isEdit = false;
				var MacroData;
				if (typeof (macro) != "undefined" && typeof (macro.params) != "undefined" && macro.params != null && macro.params != "") {
					MacroData = macro.params;
					isEdit = true;
				}
				if (ConnectionStatus == "success") {
					var url = AJS.contextPath() + "/rest/prolaborate-admin/1.0/";
					$.ajax({
						url: url,
						dataType: "json"
					}).done(function (config) { // when the configuration is returned...
						if (typeof (config) != "undefined" && typeof (config.protocol) != "undefined" && typeof (config.server) != "undefined" && config.protocol != "" && config.server != "") {
							
							//$('.info-wrap-diagram,.info-wrap-package,.info-wrap-element').show();
							$('#diagram-filter-item,#package-filter-item,#element-filter-item').html("");//Reset List
							$("#Diag-Detail,#Pkg-Detail,#Elm-Detail").show();
							$('.Diag-count,.pkg-count,.Elm-count').hide();
							$('.diag-more,.pkg-more,.Elm-more').hide();

							var macro = $('#wysiwygTextarea_ifr').contents().find("img[data-macro-name=prolaborate]");
							//var macroFlag = false; //Default value is false.
							//Check if any macro available on the ediotr with macro name : prolaborate
							//if(macro.length>0){
							//macroFlag=true;
							//}	
							//if(macroFlag == false){
							$("#diagram-type,#element-type").val('');
							RepositoryIdsList = config.repositoryIdsList;

							if (CurrentRepository == "") {
								CurrentRepository = config.repositoryId;
							}

							if (isEdit == true) {
								CurrentRepository = MacroData.repositoryId;
								if (!(RepositoryIdsList.indexOf(CurrentRepository) != -1))
									$("#repository").val("");
								retainMacroData(MacroData);
								$("#repository").val(CurrentRepository);
							} else {
								$("a[href=\"#tabs-example-first\"]").trigger("click");
								$('.check-wrap input[type=checkbox]').each(function () { this.checked = true; });
							}

							var RepVal = $("#repository").val();
							if (typeof ($("#repository").val()) == 'undefined' || $("#repository").val() == null || $("#repository").val() == "") {
								$('.btn-find').prop('disabled', true);
								$(".tabs-pane").addClass('no-repo');
							}
							else {
								$(".tabs-pane").removeClass('no-repo');
							}

							//open custom dialog
							AJS.dialog2("#demo-dialog").show();
							//}
							//else{
							//SHOW WARNING MESSAGE. MACRO ALREADY AVAILABLE.
							//var ErrorFlag = AJS.flag({
							//type: 'info',
							//title: 'Prolaborate macro already exists',
							//body: 'You can add the Prolaborate macro only once in a page',
							//});

							//setTimeout(function(){ ErrorFlag.close(); }, 5000);
							//}

						}
						else {
							AJS.dialog2($('<section id="config-warning-dialog" class="aui-dialog2 aui-dialog2-small aui-layer" role="dialog" aria-hidden="true"><header class="aui-dialog2-header"><h2 class="aui-dialog2-header-main">Macro not configured!</h2><a class="aui-dialog2-header-close" id="ProlWaringDialogClose"><span class="aui-icon aui-icon-small aui-iconfont-close-dialog">Close</span></a></header><div class="aui-dialog2-content"><p>Please click on <b>Configure</b> to add details of Prolaborate repository.</p></div><footer class="aui-dialog2-footer"><div class="aui-dialog2-footer-actions"><a href="' + AJS.contextPath() + '/plugins/servlet/prolaborate/admin" id="dialog-submit-button" class="aui-button aui-button-primary">Configure</a><button id="config-warning-dialog-cancel" class="aui-button aui-button-link">Cancel</button></div></footer></section>')).show();
						}
					}).fail(function (jqXHR, textStatus, errorThrown) {
						if (jqXHR.status == "401") {
							var ErrorFlag = AJS.flag({
								type: 'error',
								title: 'No access!',
								body: 'Prolaborate macro cannot be used without logging in. Please log in to continue.',
							});
							setTimeout(function () { ErrorFlag.close(); }, 5000);
						}
					});
				}
				else {
					AJS.dialog2($('<section id="config-warning-dialog" class="aui-dialog2 aui-dialog2-small aui-layer" role="dialog" aria-hidden="true"><header class="aui-dialog2-header"><h2 class="aui-dialog2-header-main">Unable to connect to Prolaborate</h2><a class="aui-dialog2-header-close" id="ProlWaringDialogClose"><span class="aui-icon aui-icon-small aui-iconfont-close-dialog">Close</span></a></header><div class="aui-dialog2-content"><p>' + LicenseError + ' Learn more <a href=\"https://prolaborate.sparxsystems.com/faq/confluence-integration/using-the-macro#unable-to-connect-to-prolaborate \" target=\"_blank\">here</a> </p></div><footer class="aui-dialog2-footer"><div class="aui-dialog2-footer-actions"><button id="config-warning-dialog-cancel" class="aui-button">close</button></div></footer></section>')).show();
				}

			}
		});
	}
	catch (e) { }
});

AJS.$(document).on("click", "#config-warning-dialog-cancel,#ProlWaringDialogClose", function (e) {
    e.preventDefault();
	AJS.dialog2("#config-warning-dialog").hide();
	AJS.dialog2("#config-warning-dialog").remove();
});


AJS.$(document).on("click", "#dialog-cancel-button,.ProlCustomDialogClose", function (e) {
	AJS.dialog2("#demo-dialog").hide();
});



// For filter item List selection
$(document).ready(function () {

	//Prevent Enter keypress
	//AJS.$(".ToolTip").tooltip({gravity: 'w'});
	$('#diagram-name').on('keyup keypress', function (e) {
		var keyCode = e.keyCode || e.which;
		if (keyCode === 13) {
			e.preventDefault();
			return false;
		}
	});
	$('#package-name').on('keyup keypress', function (e) {
		var keyCode = e.keyCode || e.which;
		if (keyCode === 13) {
			e.preventDefault();
			return false;
		}
	});
	$('#element-name').on('keyup keypress', function (e) {
		var keyCode = e.keyCode || e.which;
		if (keyCode === 13) {
			e.preventDefault();
			return false;
		}
	});

	//For List Selection
	$(document).on('click', ".filter-list > ul > li .filter-item-wrap", function () {
		$(this).closest('ul').find('.dialog-active').removeClass('dialog-active');
		$(this).addClass('dialog-active');
	});

	//lightbox Cancel and Deselect  
	AJS.$(document).on('click', '.btn-cancel,.menu-item a', function () {
		$('.filter-item-wrap').removeClass('dialog-active');
	});

	// aui inline dialog tooltip trigger close
	$(".filter-list").scroll(function () {
		$('aui-inline-dialog').hide();
	});

	// Diagram Filter Section
	var DiagramName;
	var DiagramType;
	var DiagramStreotype;
	var PackageName;
	var ElementName;
	var ElementType;
	var ElementStreotype;

	//Event for Find button on diagram tab
	AJS.$(document).on('click', '#btn-diagram', function () {

		$("#repository").prop('disabled', true);

		$('.info-wrap-diagram').remove();
		$('.Diag-count').hide();
		$('#Diag-Detail').hide();
		$('.diag-loader').show();
		$('#diagram-filter-item').html("");//Reset List	
		$('.diag-more').hide();

		DiagramName = $('#diagram-name').val();
		DiagramType = $("#diagram-type").val();
		DiagramStreotype = $("#diagram-stereo-type").val();
		repositoryId = $("#repository").val();
		var url1 = AJS.contextPath() + "/rest/prolaborate-admin/1.0/ProlabDiagramsList";
		AJS.$.ajax({
			url: url1,
			type: "POST",
			data: '{"repositoryId":"' + repositoryId + '", "DiagramName": "' + DiagramName + '", "Author":"", "DiagramType": "' + DiagramType + '", "Stereotype":"' + DiagramStreotype + '", "StartIndex":0}',
			dataType: "json",
			contentType: "application/json"
		}).done(function (response) { // when the configuration is returned...

			$("#repository").prop('disabled', false);

			if (typeof (response) != "undefined" && response != null && response.d.status == "success") {
				if (response.d.DiagramCount > 0) {
					$('#totalCount').text(response.d.DiagramCount);
					$('#offsetCount').text(response.d.DiagramList.length);


					$('.Diag-count').show();

					if ($('#totalCount').text() == $('#offsetCount').text()) {
						$('.diag-more').hide();
					}
					else { $('.diag-more').show(); }

					var DiagramStreoTypesJSON = response.d.DiagramList;

					$.each(DiagramStreoTypesJSON, function (i, value) {

						var FQPath = '';
						var name = ""
						if (value.Name == "")
							name = "&nbsp;";
						else
							name = escapeHtml(value.Name);//Esacape Html content -DJ
						var arrow = '<i class="aui-icon aui-icon-small aui-iconfont-arrow-down-small"></i>';
						if (value.PackageQualifiedName != '') { FQPath = replaceAll(escapeHtml(value.PackageQualifiedName), '-&gt;', arrow); }//Esacape Html content -DJ
						if (value.ElementQualifiedName != '') {
							FQPath += arrow;
							FQPath += replaceAll(escapeHtml(value.ElementQualifiedName), '-&gt;', arrow);//Esacape Html content -DJ
						}
						if (value.PackageQualifiedName == '' & value.ElementQualifiedName == '') {
							arrow = '';
						}
						FQPath += arrow + escapeHtml(value.Name);//Esacape Html content -DJ
						//Generate
						var itemDiagram = $(

							'<li id="diag_' + value.Guid + '" class ="DiagListItem"> ' +
							' <div class="filter-item-wrap diagramItem" data-guid="' + value.Guid + '">' +
							'<span class="icon-thumb icon-diagram"></span>' +
							'<div class="list-content"><p class="item-name">' + name + '</p> <p class="item-author"><span class="aui-icon aui-icon-small aui-iconfont-person"></span> ' + value.Author + ' </p> </div>' +
							'<span class="selected">Selected</span> ' +
							'</div>' +
							' <button class="item-info aui-icon aui-icon-small aui-iconfont-info-filled" data-aui-trigger aria-controls="pop_' + value.Guid + '">Click me</button>' +
							'<aui-inline-dialog id="pop_' + value.Guid + '" class="info-wrap info-wrap-diagram">' +
							'<ul class="info-details"> ' +
							'<li>' +
							'<p class="text-label">Name:</p><p class="label-info">' + name + '</p> ' +
							'</li>' +
							'<li>' +
							'<p class="text-label">Path:</p> <p class="label-info">' + FQPath + ' </p> ' +
							'</li>' +
							'<li>' +
							'<p class="text-label">Stereotype:</p><p class="label-info">' + value.Stereotype + '</p> ' +
							'</li>' +
							'<li>' +
							'<p class="text-label">Author:</p><p class="label-info">' + value.Author + '</p> ' +
							'</li>' +
							'<li>' +
							'<p class="text-label">Last Modified:</p><p class="label-info">' + moment(value.Modified).format("DD/MM/YYYY") + '</p> ' +
							'</li>' +
							'<ul> ' +
							'</aui-inline-dialog> ');
						$('#diagram-filter-item').append(itemDiagram);

					});
				}
				else {
					$('.Diag-count').hide();
					var NoResult = '<div class="no-result"><figure class="graphy-nosearch"></figure><h3>No Results</h3><p>We searched far and wide but couldn’t find any objects matching your search. Learn more <a href=\"https://prolaborate.sparxsystems.com/faq/confluence-integration/using-the-macro#no-results-in-confluence-macro \" target=\"_blank\">here</a></p></div>'
					$('#diagram-filter-item').append(NoResult);
				}

				$('.diag-loader').hide();
			}
			else {
				$('.diag-loader').hide();
				$('.Diag-count').hide();
				var NoResult = '<div class="no-result"><figure class="graphy-nosearch"></figure><h3>Unable to connect to Prolaborate</h3><p>It looks like some settings or licenses have been changed in Prolaborate after it was configured in Confluence. Please check Prolaborate configuration. Learn more <a href=\"https://prolaborate.sparxsystems.com/faq/confluence-integration/using-the-macro#unauthorized-request-or-authentication-failed \" target=\"_blank\">here</a></p></div>';
				$('#diagram-filter-item').append(NoResult);
			}
		}).fail(function () {
			$("#repository").prop('disabled', false);
			$('.diag-loader').hide();
			$('.Diag-count').hide();
			var NoResult = '<div class="no-result"><figure class="graphy-nosearch"></figure><h3>Unable to connect to Prolaborate</h3><p>It looks like some settings or licenses have been changed in Prolaborate after it was configured in Confluence. Please check Prolaborate configuration. Learn more <a href=\"https://prolaborate.sparxsystems.com/faq/confluence-integration/using-the-macro#unauthorized-request-or-authentication-failed \" target=\"_blank\">here</a></p></div>';
			$('#diagram-filter-item').append(NoResult);
		});
	});

	//Event for Find button on Package tab
	AJS.$(document).on('click', '#btn-package', function () {
		$("#repository").prop('disabled', true);

		$('.info-wrap-package').remove();
		$('.pkg-count').hide();
		$('#Pkg-Detail').hide();
		$('.pkg-loader').show();
		$('#package-filter-item').html("");//Reset List	
		$('.pkg-more').hide();

		PackageName = $('#package-name').val();
		repositoryId = $("#repository").val();

		var url1 = AJS.contextPath() + "/rest/prolaborate-admin/1.0/ProlabPackageList";
		AJS.$.ajax({
			url: url1,
			type: "POST",
			data: '{"repositoryId":"' + repositoryId + '", "PackageName": "' + PackageName + '", "Author":"", "StartIndex":0}',
			dataType: "json",
			contentType: "application/json"
		}).done(function (response) { // when the configuration is returned...

			$("#repository").prop('disabled', false);

			if (typeof (response) != "undefined" && response != null && response.d.status == "success") {
				if (response.d.PackageCount > 0) {
					$('#pkgTotalCount').text(response.d.PackageCount);
					$('#pkgOffsetCount').text(response.d.Packages.length);

					$('.pkg-more').show();
					$('.pkg-count').show();

					if ($('#pkgTotalCount').text() == $('#pkgOffsetCount').text()) { $('.pkg-more').hide(); }
					else { $('.pkg-more').show(); }

					var PackagesJSON = response.d.Packages;

					$.each(PackagesJSON, function (i, value) {

						var FQPath = '';
						var name = ""
						if (value.Name == "")
							name = "&nbsp;";
						else
							name = escapeHtml(value.Name);//Esacape Html content -DJ
						var arrow = '<i class="aui-icon aui-icon-small aui-iconfont-arrow-down-small"></i>';
						if (value.PackageQualifiedName != '') { FQPath = replaceAll(escapeHtml(value.PackageQualifiedName), '-&gt;', arrow); }//Esacape Html content -DJ
						if (value.ElementQualifiedName != '') {
							FQPath += arrow;
							FQPath += replaceAll(escapeHtml(value.ElementQualifiedName), '-&gt;', arrow);//Esacape Html content -DJ
						}
						if (value.PackageQualifiedName == '' & value.ElementQualifiedName == '') {
							arrow = '';
						}
						//FQPath +=arrow+value.Name;
						//Generate
						//console.log(value);
						var itemPackage = $(

							'<li id="pkg_' + value.Guid + '" class ="PkgListItem"> ' +
							' <div class="filter-item-wrap packageItem" data-guid="' + value.Guid + '">' +
							'<span class="icon-thumb icon-folder"></span>' +
							'<div class="list-content"> <p class="item-name">' + name + '</p> <p class="item-author"><span class="aui-icon aui-icon-small aui-iconfont-person"></span>' + value.Author + '</p></div>' + '<span class="selected">Selected</span>' +
							'</div>' +
							' <button class="item-info aui-icon aui-icon-small aui-iconfont-info-filled" data-aui-trigger aria-controls="pop_' + value.Guid + '">Click me</button>' +
							'<aui-inline-dialog id="pop_' + value.Guid + '" class="info-wrap info-wrap-package">' +
							'<ul class="info-details"> ' +
							'<li>' +
							'<p class="text-label">Name:</p><p class="label-info">' + name + '</p> ' +
							'</li>' +
							'<li>' +
							'<p class="text-label">Path:</p> <p class="label-info">' + FQPath + ' </p> ' +
							'</li>' +
							'<li>' +
							'<p class="text-label">Author:</p><p class="label-info">' + value.Author + '</p> ' +
							'</li>' +
							'<li>' +
							'<p class="text-label">Last Modified:</p><p class="label-info">' + moment(value.Modified).format("DD/MM/YYYY") + '</p> ' +
							'</li>' +
							'<ul> ' +
							'</aui-inline-dialog> ');
						$('#package-filter-item').append(itemPackage);

					});
				}
				else {
					$('.pkg-count').hide();
					var NoResult = '<div class="no-result"><figure class="graphy-nosearch"></figure><h3>No Results</h3><p>We searched far and wide but couldn’t find any objects matching your search. Learn more <a href=\"https://prolaborate.sparxsystems.com/faq/confluence-integration/using-the-macro#no-results-in-confluence-macro \" target=\"_blank\">here</a></p></div>'
					$('#package-filter-item').append(NoResult);
				}
				$('.pkg-loader').hide();
			}

			else {
				$('.pkg-count').hide();
				$('.pkg-loader').hide();
				var NoResult = '<div class="no-result"><figure class="graphy-nosearch"></figure><h3>Unable to connect to Prolaborate</h3><p>It looks like some settings or licenses have been changed in Prolaborate after it was configured in Confluence. Please check Prolaborate configuration. Learn more <a href=\"https://prolaborate.sparxsystems.com/faq/confluence-integration/using-the-macro#unauthorized-request-or-authentication-failed \" target=\"_blank\">here</a></p></div>';
				$('#package-filter-item').append(NoResult);
			}
		}).fail(function () {
			$("#repository").prop('disabled', false);
			$('.pkg-count').hide();
			$('.pkg-loader').hide();
			var NoResult = '<div class="no-result"><figure class="graphy-nosearch"></figure><h3>Unable to connect to Prolaborate</h3><p>It looks like some settings or licenses have been changed in Prolaborate after it was configured in Confluence. Please check Prolaborate configuration. Learn more <a href=\"https://prolaborate.sparxsystems.com/faq/confluence-integration/using-the-macro#unauthorized-request-or-authentication-failed \" target=\"_blank\">here</a></p></div>';
			$('#package-filter-item').append(NoResult);
		});

	});

	//Event for Find button on Element tab
	AJS.$(document).on('click', '#btn-element', function () {
		$("#repository").prop('disabled', true);

		$('.info-wrap-element').remove();
		$('.Elm-count').hide();
		$('#Elm-Detail').hide();
		$('.Elm-loader').show();
		$('#element-filter-item').html("");//Reset List	
		$('.Elm-more').hide();

		ElementName = $('#element-name').val();
		ElementType = $("#element-type").val();
		ElementStreotype = $("#element-stereo-type").val();
		repositoryId = $("#repository").val();

		var url1 = AJS.contextPath() + "/rest/prolaborate-admin/1.0/ProlabElementList";
		AJS.$.ajax({
			url: url1,
			type: "POST",
			data: '{"repositoryId":"' + repositoryId + '", "ElementName": "' + ElementName + '", "Author":"", "ElementType": "' + ElementType + '", "Stereotype":"' + ElementStreotype + '", "StartIndex":0}',
			dataType: "json",
			contentType: "application/json"
		}).done(function (response) { // when the configuration is returned...

			$("#repository").prop('disabled', false);

			if (typeof (response) != "undefined" && response != null && response.d.status == "success") {
				if (response.d.ElementCount > 0) {
					$('#ElmTotalCount').text(response.d.ElementCount);
					$('#ElmOffsetCount').text(response.d.Elements.length);


					$('.Elm-count').show();

					$('.Diag-count').show();
					$('#Diag-Detail').hide();

					if ($('#ElmTotalCount').text() == $('#ElmOffsetCount').text()) {
						$('.Elm-more').hide();
					}
					else { $('.Elm-more').show(); }

					var ElementsJSON = response.d.Elements;

					$.each(ElementsJSON, function (i, value) {

						var FQPath = '';
						var name = ""
						if (value.Name == "")
							name = "&nbsp;";
						else
							name = escapeHtml(value.Name);//Esacape Html content -DJ
						var arrow = '<i class="aui-icon aui-icon-small aui-iconfont-arrow-down-small"></i>';
						if (value.PackageQualifiedName != '') { FQPath = replaceAll(escapeHtml(value.PackageQualifiedName), '-&gt;', arrow); }//Esacape Html content -DJ
						if (value.ElementQualifiedName != '') {
							FQPath += arrow;
							FQPath += replaceAll(escapeHtml(value.ElementQualifiedName), '-&gt;', arrow);//Esacape Html content -DJ
						}
						if (value.PackageQualifiedName == '' & value.ElementQualifiedName == '') {
							arrow = '';
						}
						FQPath += arrow + escapeHtml(value.Name);//Esacape Html content -DJ
						//Generate
						var itemElement = $(

							'<li id="pkg_' + value.Guid + '" class ="ElmListItem"> ' +
							' <div class="filter-item-wrap elementItem" data-guid="' + value.Guid + '">' +
							'<span class="icon-thumb icon-element"></span>' +
							'<div class="list-content"><p class="item-name">' + name + '</p> <p class="item-author"><span class="aui-icon aui-icon-small aui-iconfont-person"></span> ' + value.Author + ' </p> </div>' +
							'<span class="selected">Selected</span> ' +
							'</div>' +
							' <button class="item-info aui-icon aui-icon-small aui-iconfont-info-filled" data-aui-trigger aria-controls="pop_' + value.Guid + '">Click me</button>' +
							'<aui-inline-dialog id="pop_' + value.Guid + '" class="info-wrap info-wrap-element">' +
							'<ul class="info-details"> ' +
							'<li>' +
							'<p class="text-label">Name:</p><p class="label-info">' + name + '</p> ' +
							'</li>' +
							'<li>' +
							'<p class="text-label">Path:</p> <p class="label-info">' + FQPath + ' </p> ' +
							'</li>' +
							'<li>' +
							'<p class="text-label">Stereotype:</p><p class="label-info">' + value.Stereotype + '</p> ' +
							'</li>' +
							'<li>' +
							'<p class="text-label">Author:</p><p class="label-info">' + value.Author + '</p> ' +
							'</li>' +
							'<li>' +
							'<p class="text-label">Last Modified:</p><p class="label-info">' + moment(value.Modified).format("DD/MM/YYYY") + '</p> ' +
							'</li>' +
							'<ul> ' +
							'</aui-inline-dialog> ');
						$('#element-filter-item').append(itemElement);

					});
				}
				else {
					$('.Elm-count').hide();
					var NoResult = '<div class="no-result"><figure class="graphy-nosearch"></figure><h3>No Results</h3><p>We searched far and wide but couldn’t find any objects matching your search. Learn more <a href=\"https://prolaborate.sparxsystems.com/faq/confluence-integration/using-the-macro#no-results-in-confluence-macro \" target=\"_blank\">here</a></p></div>'
					$('#element-filter-item').append(NoResult);
				}
				$('.Elm-loader').hide();
			}
			else {
				$('.Elm-count').hide();
				$('.Elm-loader').hide();
				var NoResult = '<div class="no-result"><figure class="graphy-nosearch"></figure><h3>Unable to connect to Prolaborate</h3><p>It looks like some settings or licenses have been changed in Prolaborate after it was configured in Confluence. Please check Prolaborate configuration. Learn more <a href=\"https://prolaborate.sparxsystems.com/faq/confluence-integration/using-the-macro#unauthorized-request-or-authentication-failed \" target=\"_blank\">here</a></p></div>';
				$('#element-filter-item').append(NoResult);
			}
		}).fail(function () {
			$("#repository").prop('disabled', false);
			$('.Elm-count').hide();
			$('.Elm-loader').hide();
			var NoResult = '<div class="no-result"><figure class="graphy-nosearch"></figure><h3>Unable to connect to Prolaborate</h3><p>It looks like some settings or licenses have been changed in Prolaborate after it was configured in Confluence. Please check Prolaborate configuration. Learn more <a href=\"https://prolaborate.sparxsystems.com/faq/confluence-integration/using-the-macro#unauthorized-request-or-authentication-failed \" target=\"_blank\">here</a></p></div>';
			$('#element-filter-item').append(NoResult);
		});

	});

	//Diagram tab view more event
	AJS.$(document).on('click', '#Diag-ViewMore', function () {
		$("#repository").prop('disabled', true);

		if ($('.DiagListItem').length > 0) {

			var offsetCount = $('.DiagListItem').length;
			var repositoryId = $('#repository').val();

			var url1 = AJS.contextPath() + "/rest/prolaborate-admin/1.0/ProlabDiagramsList";
			AJS.$.ajax({
				url: url1,
				type: "POST",
				data: '{"repositoryId":"' + repositoryId + '", "DiagramName": "' + DiagramName + '", "Author":"", "DiagramType": "' + DiagramType + '", "Stereotype":"' + DiagramStreotype + '", "StartIndex":"' + offsetCount + '"}',
				dataType: "json",
				contentType: "application/json"
			}).done(function (response) { // when the configuration is returned...

				$("#repository").prop('disabled', false);

				if (typeof (response) != "undefined" && response != null && response.d.status == "success") {

					$('#totalCount').text(response.d.DiagramCount);
					$('#offsetCount').text(Number(offsetCount) + Number(response.d.DiagramList.length));

					$('.Diag-count').show();
					$('#Diag-Detail').hide();

					if ($('#totalCount').text() == $('#offsetCount').text()) {
						$('.diag-more').hide();
					}
					else { $('.diag-more').show(); }

					var DiagramStreoTypesJSON = response.d.DiagramList;
					$.each(DiagramStreoTypesJSON, function (i, value) {

						var FQPath = '';
						var name = ""
						if (value.Name == "")
							name = "&nbsp;";
						else
							name = escapeHtml(value.Name);//Esacape Html content -DJ
						var arrow = '<i class="aui-icon aui-icon-small aui-iconfont-arrow-down-small"></i>';
						if (value.PackageQualifiedName != '') { FQPath = replaceAll(escapeHtml(value.PackageQualifiedName), '-&gt;', arrow); }//Esacape Html content -DJ
						if (value.ElementQualifiedName != '') {
							FQPath += arrow;
							FQPath += replaceAll(escapeHtml(value.ElementQualifiedName), '-&gt;', arrow);//Esacape Html content -DJ
						}
						if (value.PackageQualifiedName == '' & value.ElementQualifiedName == '') {
							arrow = '';
						}
						FQPath += arrow + escapeHtml(value.Name);//Esacape Html content -DJ
						//Generate
						var itemDiagram = $(

							'<li id="diag_' + value.Guid + '" class ="DiagListItem"> ' +
							' <div class="filter-item-wrap diagramItem" data-guid="' + value.Guid + '">' +
							'<span class="icon-thumb icon-diagram"></span>' +
							'<div class="list-content"><p class="item-name">' + name + '</p><p class="item-author"><span class="aui-icon aui-icon-small aui-iconfont-person"></span> ' + value.Author + ' </p> </div>' +
							'<span class="selected">Selected</span> ' +
							'</div>' +
							' <button class="item-info aui-icon aui-icon-small aui-iconfont-info-filled" data-aui-trigger aria-controls="pop_' + value.Guid + '">Click me</button>' +
							'<aui-inline-dialog id="pop_' + value.Guid + '" class="info-wrap">' +
							'<ul class="info-details"> ' +
							'<li>' +
							'<p class="text-label">Name:</p><p class="label-info">' + name + '</p> ' +
							'</li>' +
							'<li>' +
							'<p class="text-label">Path:</p> <p class="label-info">' + FQPath + '</p> ' +
							'</li>' +
							'<li>' +
							'<p class="text-label">Stereotype:</p><p class="label-info">' + value.Stereotype + '</p> ' +
							'</li>' +
							'<li>' +
							'<p class="text-label">Author:</p><p class="label-info">' + value.Author + '</p> ' +
							'</li>' +
							'<li>' +
							'<p class="text-label">Last Modified:</p><p class="label-info">' + moment(value.Modified).format("DD/MM/YYYY") + '</p> ' +
							'</li>' +
							'<ul> ' +
							'</aui-inline-dialog> ');
						$('#diagram-filter-item').append(itemDiagram);

					});
				}

				else {

				}
			}).fail(function () {
				$("#repository").prop('disabled', false);
				$('.diag-loader').hide();
			});
		}
	});

	//Package tab view more event
	AJS.$(document).on('click', '#Pkg-ViewMore', function () {
		$("#repository").prop('disabled', true);

		if ($('.PkgListItem').length > 0) {

			var offsetCount = $('.PkgListItem').length;
			var repositoryId = $('#repository').val();


			var url1 = AJS.contextPath() + "/rest/prolaborate-admin/1.0/ProlabPackageList";
			AJS.$.ajax({
				url: url1,
				type: "POST",
				data: '{"repositoryId":"' + repositoryId + '", "PackageName": "' + PackageName + '", "Author":"", "StartIndex":"' + offsetCount + '"}',
				dataType: "json",
				contentType: "application/json"
			}).done(function (response) { // when the configuration is returned...

				$("#repository").prop('disabled', false);

				if (typeof (response) != "undefined" && response != null && response.d.status == "success") {

					$('#pkgTotalCount').text(response.d.PackageCount);
					$('#pkgOffsetCount').text(Number(offsetCount) + Number(response.d.Packages.length));

					$('.pkg-count').show();
					$('#Pkg-Detail').hide();

					if ($('#pkgTotalCount').text() == $('#pkgOffsetCount').text()) { $('.pkg-more').hide(); }
					else { $('.pkg-more').show(); }

					var PackagesJSON = response.d.Packages;
					$.each(PackagesJSON, function (i, value) {

						var FQPath = '';
						var name = ""
						if (value.Name == "")
							name = "&nbsp;";
						else
							name = escapeHtml(value.Name);//Esacape Html content -DJ
						var arrow = '<i class="aui-icon aui-icon-small aui-iconfont-arrow-down-small"></i>';
						if (value.PackageQualifiedName != '') { FQPath = replaceAll(escapeHtml(value.PackageQualifiedName), '-&gt;', arrow); }//Esacape Html content -DJ
						if (value.ElementQualifiedName != '') {
							FQPath += arrow;
							FQPath += replaceAll(escapeHtml(value.ElementQualifiedName), '-&gt;', arrow);//Esacape Html content -DJ
						}
						if (value.PackageQualifiedName == '' & value.ElementQualifiedName == '') {
							arrow = '';
						}
						//FQPath +=arrow+value.Name;
						//Generate
						var itemPackage = $(

							'<li id="pkg_' + value.Guid + '" class ="PkgListItem"> ' +
							' <div class="filter-item-wrap packageItem" data-guid="' + value.Guid + '">' +
							'<span class="icon-thumb icon-folder"></span>' +
							'<div class="list-content"> <p class="item-name">' + name + '</p><p class="item-author"><span class="aui-icon aui-icon-small aui-iconfont-person"></span> ' + value.Author + ' </p><span class="selected">Selected</span> ' +
							'</div>' +
							' <button class="item-info aui-icon aui-icon-small aui-iconfont-info-filled" data-aui-trigger aria-controls="pop_' + value.Guid + '">Click me</button>' +
							'<aui-inline-dialog id="pop_' + value.Guid + '" class="info-wrap">' +
							'<ul class="info-details"> ' +
							'<li>' +
							'<p class="text-label">Name:</p><p class="label-info">' + name + '</p> ' +
							'</li>' +
							'<li>' +
							'<p class="text-label">Path:</p> <p class="label-info">' + FQPath + '</p> ' +
							'</li>' +
							'<li>' +
							'<p class="text-label">Author:</p><p class="label-info">' + value.Author + '</p> ' +
							'</li>' +
							'<li>' +
							'<p class="text-label">Last Modified:</p><p class="label-info">' + moment(value.Modified).format("DD/MM/YYYY") + '</p> ' +
							'</li>' +
							'<ul> ' +
							'</aui-inline-dialog> ');
						$('#package-filter-item').append(itemPackage);

					});


				}

				else {

				}
			}).fail(function () {
				$("#repository").prop('disabled', false);
				$('.pkg-loader').hide();
			});


		}

	});

	//Element tab view more event
	AJS.$(document).on('click', '#Elm-ViewMore', function () {
		$("#repository").prop('disabled', true);
		if ($('.ElmListItem').length > 0) {
			var offsetCount = $('.ElmListItem').length;
			var repositoryId = $('#repository').val();

			var url1 = AJS.contextPath() + "/rest/prolaborate-admin/1.0/ProlabElementList";
			AJS.$.ajax({
				url: url1,
				type: "POST",
				data: '{"repositoryId":"' + repositoryId + '", "ElementName": "' + ElementName + '", "Author":"", "ElementType": "' + ElementType + '", "Stereotype":"' + ElementStreotype + '", "StartIndex":"' + offsetCount + '"}',
				dataType: "json",
				contentType: "application/json"
			}).done(function (response) { // when the configuration is returned...

				$("#repository").prop('disabled', false);

				if (typeof (response) != "undefined" && response != null && response.d.status == "success") {
					$('#ElmTotalCount').text(response.d.ElementCount);
					$('#ElmOffsetCount').text(Number(offsetCount) + Number(response.d.Elements.length));

					$('.Elm-count').show();
					$('#Elm-Detail').hide();

					if ($('#ElmTotalCount').text() == $('#ElmOffsetCount').text()) {
						$('.Elm-more').hide();
					}
					else { $('.Elm-more').show(); }

					var ElementsJSON = response.d.Elements;
					$.each(ElementsJSON, function (i, value) {
						var FQPath = '';
						var name = ""
						if (value.Name == "")
							name = "&nbsp;";
						else
							name = escapeHtml(value.Name);//Esacape Html content -DJ
						var arrow = '<i class="aui-icon aui-icon-small aui-iconfont-arrow-down-small"></i>';
						if (value.PackageQualifiedName != '') { FQPath = replaceAll(escapeHtml(value.PackageQualifiedName), '-&gt;', arrow); }//Esacape Html content -DJ
						if (value.ElementQualifiedName != '') {
							FQPath += arrow;
							FQPath += replaceAll(escapeHtml(value.ElementQualifiedName), '-&gt;', arrow);//Esacape Html content -DJ
						}
						if (value.PackageQualifiedName == '' & value.ElementQualifiedName == '') {
							arrow = '';
						}
						FQPath += arrow + escapeHtml(value.Name);//Esacape Html content -DJ

						//Generate
						var itemElement = $(
							'<li id="pkg_' + value.Guid + '" class ="ElmListItem"> ' +
							' <div class="filter-item-wrap elementItem" data-guid="' + value.Guid + '">' +
							'<span class="icon-thumb icon-element"></span>' +
							'<div class="list-content"><p class="item-name">' + name + '</p><p class="item-author"><span class="aui-icon aui-icon-small aui-iconfont-person"></span> ' + value.Author + ' </p><span class="selected">Selected</span> ' +
							'</div>' +
							' <button class="item-info aui-icon aui-icon-small aui-iconfont-info-filled" data-aui-trigger aria-controls="pop_' + value.Guid + '">Click me</button>' +
							'<aui-inline-dialog id="pop_' + value.Guid + '" class="info-wrap">' +
							'<ul class="info-details"> ' +
							'<li>' +
							'<p class="text-label">Name:</p><p class="label-info">' + name + '</p> ' +
							'</li>' +
							'<li>' +
							'<p class="text-label">Path:</p> <p class="label-info">' + FQPath + '</p> ' +
							'</li>' +
							'<li>' +
							'<p class="text-label">Stereotype:</p><p class="label-info">' + value.Stereotype + '</p> ' +
							'</li>' +
							'<li>' +
							'<p class="text-label">Author:</p><p class="label-info">' + value.Author + '</p> ' +
							'</li>' +
							'<li>' +
							'<p class="text-label">Last Modified:</p><p class="label-info">' + moment(value.Modified).format("DD/MM/YYYY") + '</p> ' +
							'</li>' +
							'<ul> ' +
							'</aui-inline-dialog> ');
						$('#element-filter-item').append(itemElement);
					});
				}
				else {
				}
			}).fail(function () {
				$("#repository").prop('disabled', false);
				$('.Elm-loader').hide();
			});
		}
	});

	//Repository select event
	AJS.$(document).on('change', '#repository', function () {
		var SelectRepository = $(this).val();
		if (SelectRepository != "") {
			$(".tabs-pane").removeClass('no-repo');
			$('.btn-find').prop('disabled', false);
			//Update Stereotype
			getProlaborateDiagramStereotypes(SelectRepository);
			getProlaborateElementStereotypes(SelectRepository);
			$("#diagram-type,#element-type").val('');
		}
		else {
			$(".tabs-pane").addClass('no-repo');
			$('.btn-find').prop('disabled', true);
		}
		//Reset List
		$('#Diag-Detail').show();
		$('.info-wrap-diagram').remove();
		$('.Diag-count').hide();
		$('#diagram-filter-item').html("");//Reset List	
		$('.diag-more').hide();
		$('.diag-loader').hide()

		$('#Elm-Detail').show();
		$('.info-wrap-element').remove();
		$('.Elm-count').hide();
		$('#element-filter-item').html("");//Reset List	
		$('.Elm-more').hide();
		$('.Elm-loader').hide();

		$('#Pkg-Detail').show();
		$('.info-wrap-package').remove();
		$('.pkg-count').hide();
		$('#package-filter-item').html("");//Reset List	
		$('.pkg-more').hide();
		$('.pkg-loader').hide();
	});
});


//Event for Insert Diagram button.
AJS.$(document).on('click', '#diagram-submit-button', function (e) {
	//check if any diagram is selected
	if ($('.diagramItem.dialog-active').length > 0) {
		var repositoryId = $('#repository').val();
		var selection = AJS.Rte.getEditor().selection.getNode();
		var diagramName = $('.diagramItem.dialog-active').find('p.item-name').text();
		var selectedGuid = $('.diagramItem.dialog-active').attr('data-guid');
		selectedGuid = selectedGuid.substring(1, 37);
		var ShowChildrenVal = "1";
		if ($("#showDiagramObjects").is(':checked')) {
			ShowChildrenVal = "1";
		}
		else {
			ShowChildrenVal = "0";
		}
		var enableProlaborateLink = "1";
		if ($("#enableDiagramLink").is(':checked')) {
			enableProlaborateLink = "1";
		}
		else {
			enableProlaborateLink = "0";
		}
		var enableDiagramPath = "1";
		if ($("#enableDiagramPath").is(':checked')) { // Hide/show FqPth -DJ -V1.11
			enableDiagramPath = "1";
		}
		else {
			enableDiagramPath = "0";
		}
		var enableDiagramBorder = "1";
		if ($("#enableDiagramBorder").is(':checked')) { // Hide/show border -DJ -V1.11
			enableDiagramBorder = "1";
		}
		else {
			enableDiagramBorder = "0";
		}
		var macro = {
			"name": "prolaborate",
			"body": "<H1>Demo Text</H1>",
			"params": {
				"repositoryId": repositoryId,
				"Name": diagramName,
				"Type": "Diagram",
				"Guid": selectedGuid,
				"ShowChildren": ShowChildrenVal,
				"EnableLink": enableProlaborateLink,
				"EnablePath": enableDiagramPath, // Hide/show FqPth -DJ -V1.11
				"EnableBorder": enableDiagramBorder // Hide/show border -DJ -V1.11
			}
		}; 
		//console.log(macro);
		tinymce.confluence.macrobrowser.macroBrowserComplete(macro);
		AJS.dialog2("#demo-dialog").hide();
	}
	else {

	}
});

//Event for Insert Element button.
AJS.$(document).on('click', '#element-submit-button', function (e) {
	var repositoryId = $('#repository').val();
	//Check if any element is selected
	if ($('.elementItem.dialog-active').length > 0) {
		var selection = AJS.Rte.getEditor().selection.getNode();
		var elementName = $('.elementItem.dialog-active').find('p.item-name').text();
		var selectedGuid = $('.elementItem.dialog-active').attr('data-guid');
		selectedGuid = selectedGuid.substring(1, 37);

		var ShowChildrenVal = "1";
		if ($("#showElementChildren").is(':checked')) {
			ShowChildrenVal = "1";
		}
		else {
			ShowChildrenVal = "0";
		}
		var enableProlaborateLink = "1";
		if ($("#enableElementChildLink").is(':checked')) {
			enableProlaborateLink = "1";
		}
		else {
			enableProlaborateLink = "0";
		}
		var enableElementPath = "1";
		if ($("#enableElementPath").is(':checked')) { // Hide/show FqPth -DJ -V1.11
			enableElementPath = "1";
		}
		else {
			enableElementPath = "0";
		}
		var enableElementBorder = "1";
		if ($("#enableElementBorder").is(':checked')) { // Hide/show border -DJ -V1.11
			enableElementBorder = "1";
		}
		else {
			enableElementBorder = "0";
		}

		var macro = {
			"name": "prolaborate",
			"body": "<H1>Demo Text</H1>",
			"params": {
				"repositoryId": repositoryId,
				"Name": elementName,
				"Type": "Element",
				"Guid": selectedGuid,
				"ShowChildren": ShowChildrenVal,
				"EnableLink": enableProlaborateLink,
				"EnablePath": enableElementPath, // Hide/show FqPth -DJ -V1.11
				"EnableBorder": enableElementBorder // Hide/show border -DJ -V1.11
			}
		};
		tinymce.confluence.macrobrowser.macroBrowserComplete(macro);
		AJS.dialog2("#demo-dialog").hide();
	}
	else {

	}
});

//Event for Insert Package button.
AJS.$(document).on('click', '#package-submit-button', function (e) {
	var repositoryId = $('#repository').val();
	//Check if any package is selected.
	if ($('.packageItem.dialog-active').length > 0) {
		var selection = AJS.Rte.getEditor().selection.getNode();
		var packageName = $('.packageItem.dialog-active').find('p.item-name').text();
		var selectedGuid = $('.packageItem.dialog-active').attr('data-guid');
		selectedGuid = selectedGuid.substring(1, 37);
		var ShowChildrenVal = "1";
		if ($("#showPackageChildren").is(':checked')) {
			ShowChildrenVal = "1";
		}
		else {
			ShowChildrenVal = "0";
		}
		var enableProlaborateLink = "1";
		if ($("#enablePackageChildLink").is(':checked')) {
			enableProlaborateLink = "1";
		}
		else {
			enableProlaborateLink = "0";
		}
		var enableElementPath = "1";
		if ($("#enablePackagePath").is(':checked')) { // Hide/show FqPth -DJ -V1.11
			enableElementPath = "1";
		}
		else {
			enableElementPath = "0";
		}
		var enableElementBorder = "1";
		if ($("#enablePackageBorder").is(':checked')) { // Hide/show border -DJ -V1.11
			enableElementBorder = "1";
		}
		else {
			enableElementBorder = "0";
		}

		var macro = {
			"name": "prolaborate",
			"body": "<H1>Demo Text</H1>",
			"params": {
				"repositoryId": repositoryId,
				"Name": packageName,
				"Type": "Package",
				"Guid": selectedGuid,
				"ShowChildren": ShowChildrenVal,
				"EnableLink": enableProlaborateLink,
				"EnablePath": enableElementPath, // Hide/show FqPth -DJ -V1.11
				"EnableBorder": enableElementBorder // Hide/show border -DJ -V1.11
			}
		};;
		tinymce.confluence.macrobrowser.macroBrowserComplete(macro);
		AJS.dialog2("#demo-dialog").hide();
	}
	else {

	}
});
	
//To retrieve diagram stereotypes list.
function getProlaborateDiagramStereotypes(repositoryId) {

	$("#diagram-stereo-type").prop('disabled', true);
	$("#diagram-stereo-type").html("<option value=\"\">Select Stereotype</option>");
	var dataContent = '{"repositoryId":"' + repositoryId + '"}';

	$('#diagram-stereo-type').html("");
	$('#diagram-stereo-type').append("<option value=\"\">Select Stereotype </option>");

	var url1 = AJS.contextPath() + "/rest/prolaborate-admin/1.0/ProlabDiagramStereotypes";
	AJS.$.ajax({
		url: url1,
		type: "POST",
		data: dataContent,
		dataType: "json",
		contentType: "application/json",

	}).done(function (response) { // when the configuration is returned...
		if (response != null && response.d != null && response.d.DiagramStereoTypes != null) {
			var DiagramStreoTypesJSON = response.d.DiagramStereoTypes;
			$.each(DiagramStreoTypesJSON, function (i, value) {
				$('#diagram-stereo-type').append($('<option>').text(value).attr('value', value));
			});
		}
		$("#diagram-stereo-type").prop('disabled', false);
	}).fail(function () {
		$("#diagram-stereo-type").prop('disabled', false);
	});
}

//To retrieve Element stereotypes list.
function getProlaborateElementStereotypes(repositoryId) {
	$("#element-stereo-type").prop('disabled', true);
	$('#element-stereo-type').html("<option value=\"\">Select Stereotype</option>");
	var dataContent = '{"repositoryId":"' + repositoryId + '"}';

	$('#element-stereo-type').html("");
	$('#element-stereo-type').append("<option value=\"\">Select Stereotype </option>");

	var url1 = AJS.contextPath() + "/rest/prolaborate-admin/1.0/ProlabElementStereotypes";
	AJS.$.ajax({
		url: url1,
		type: "POST",
		data: dataContent,
		dataType: "json",
		contentType: "application/json",
	}).done(function (response) { // when the configuration is returned...
		if (response != null && response.d != null && response.d.ElementStereoTypes != null) {
			var ElementStreoTypesJSON = response.d.ElementStereoTypes;
			$.each(ElementStreoTypesJSON, function (i, value) {
				$('#element-stereo-type').append($('<option>').text(value).attr('value', value));
			});
		}
		$("#element-stereo-type").prop('disabled', false);
	}).fail(function () {
		$("#element-stereo-type").prop('disabled', false);
	});
}

function replaceAll(str, find, replace) {
	return str.replace(new RegExp(find, 'g'), replace);
}

function getProlaborateRepositories(selectedId) {
	var url = AJS.contextPath() + "/rest/prolaborate-admin/1.0/ProlabReps";
	AJS.$.ajax({
		url: url,
		dataType: "json"
	}).done(function (response) { // when the configuration is returned...
		if (response.d.status == "success") {
			var repositories = response.d.repositoryList;
			if (typeof (RepositoryIdsList) == "undefined" || RepositoryIdsList == '') {
				RepositoryIdsList = CurrentRepository;
			}
			var optionHtml = "<option value=\"\"> --> Select Repository <-- </option>";
			$.each(repositories, function (index, val) {
				if (!(RepositoryIdsList.indexOf(val.RepositoryId) != -1) || val.RepositoryIsEnabled != "true" || val.IsRepositoryShareEnabled != "true")
					return;
				var selected = "";
				if (typeof (selectedId) != "undefined" && selectedId != "" && val.RepositoryId == selectedId) {
					selected = "selected";
				}
				else {
					selected = "";
				}
				optionHtml += "<option value = '" + val.RepositoryId + "' " + selected + ">" + val.RepositoryName + "</option>";
			});
			$("#repository").html('');//RZN
			$("#repository").append(optionHtml);
			//$("#repository").val(CurrentRepository);
		}
		else {
			var optionHtml = "<option value=\"\" selected>-->Select Repository<--</option>";
			$("#repository").html('');//RZN
			$("#repository").append(optionHtml);
		}
	}).fail(function () {
		var optionHtml = "<option value=\"\" selected>-->Select Repository<--</option>";
		$("#repository").html('');//RZN
		$("#repository").append(optionHtml);
	});
}

function getProlaborateConnection() {
	var url = AJS.contextPath() + "/rest/prolaborate-admin/1.0/ProlabConnect";
	AJS.$.ajax({
		url: url,
		dataType: "json"
	}).done(function (response) { // when the configuration is returned...
		if (response.d.status == "success") {
			ConnectionStatus = "success";
			getProlaborateDiagramStereotypes("");
			getProlaborateElementStereotypes("");
			//getProlaborateRepositories("");
			LicenseError = "";
		}
		else {
			ConnectionStatus = "fail";
			LicenseError = "Not able to connect to Prolaborate server. Please check and try again.";

			if (typeof (response.d.LicenseErrorKey) != "undefined" && response.d.LicenseErrorKey != null && response.d.LicenseErrorKey != "")
				LicenseError = 'It looks like some settings or licenses have been changed in Prolaborate after it was configured in Confluence. Please check Prolaborate configuration.';
		}
	}).fail(function (jqXHR, textStatus, errorThrown) {
		ConnectionStatus = "fail";
		LicenseError = "Not able to connect to Prolaborate server. Please check and try again.";
		if (jqXHR.status == "403") {
			LicenseError = "It looks like some settings or licenses have been changed in Prolaborate after it was configured in Confluence. Please check Prolaborate configuration.";
		}
	});
}

var entityMap = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;',
	'/': '&#x2F;',
	'`': '&#x60;',
	'=': '&#x3D;'
};
	
	//Esacape Html content -DJ
function escapeHtml(string) {
	return String(string).replace(/[&<>"'`=\/]/g, function (s) {
		return entityMap[s];
	});
}