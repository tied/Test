(function ($) { // this closure helps us keep our variables to ourselves.
// This pattern is known as an "iife" - immediately invoked function expression
 
    // form the URL
    var url = AJS.contextPath() + "/rest/prolaborate-admin/1.0/";
 
    // wait for the DOM (i.e., document "skeleton") to load. This likely isn't necessary for the current case,
    // but may be helpful for AJAX that provides secondary content.
    $(document).ready(function() { //alert(123);
        // request the config information from the server
		AJS.$(".ToolTip").tooltip({gravity: 'w'});
        $.ajax({
            url: url,
            dataType: "json"
        }).done(function(config) { // when the configuration is returned...
			
        	if(typeof(config) != "undefined" && typeof(config.protocol) != "undefined" && typeof(config.server) != "undefined" && config.protocol != "" && config.server != ""){      	
        		//getProlaborateRepositories(config.repositoryId);
				CurrentRepository = config.repositoryId;
				RepositoryIdsList = config.repositoryIdsList;
				$("#saveBlock").hide();
				$("#editButton").show();
				
				$("#protocol").attr('disabled', true);
				$("#server").attr('disabled', true);
				$("#port").attr('disabled', true);
				$("#token").attr('disabled', true);
				$("#userid").attr('disabled', true);
				
				$("#cancelBlock").hide();
				
				 // ...populate the form.
            $("#protocol").val(config.protocol);
            $("#server").val(config.server);
            $("#port").val(config.port);
			$("#token").val(config.token);
			$("#userid").val(config.userid);
            $("#repository").val(config.repositoryId);
            $("#repository").attr('disabled', true);

        	}
			else{
				$("#saveBlock").hide();
				$("#editButton").hide();
				$("#chooseRepBlock").hide();
				
				$("#protocol").attr('disabled', false);
				$("#server").attr('disabled', false);
				$("#port").attr('disabled', false);
				$("#token").attr('disabled', false)
				$("#userid").attr('disabled', false)
				
				$("#cancelBlock").show();
			}
           
            
        });
		ActiveSwitchery();
		// //Get Confluence baseURL protocol
		// var base_url = window.location.protocol;
		// if(base_url=="https:")
			// $('option[value=http]').prop('disabled', true);
		
		AJS.$("#admin").submit(function(e) {
			e.preventDefault();
			if($('#saveBlock:hidden').length == 0)
			{
			 updateConfig();
			}
		});
			
		AJS.$(document).on('click', '#connectButton', function(){
			connectProlaborate();
			
		});
		
		AJS.$(document).on('click', '#editButton', function(){
			
			$("#saveBlock").hide();
			$("#editButton").hide();
			$("#chooseRepBlock").hide();
			
			$("#protocol").attr('disabled', false);
			$("#server").attr('disabled', false);
			$("#port").attr('disabled', false);
			$("#token").attr('disabled', false);
			$("#userid").attr('disabled', false);
			$("#repository").attr('disabled', false);
			//$("#repository").html('');
			$("#cancelBlock").show();
			
		});
		
		// //Repository select event
		// $('#repository').change(function() {
			// if(CurrentRepository!="" && CurrentRepository!=AJS.$("#repository").val())
			// {
			 // var ErrorFlag = AJS.flag({
				// type: 'error',
				// title: 'Warning!',
				// body: 'If you change the repository, all the Prolaborate macros added so far will not work.',
			// });
			// setTimeout(function(){ ErrorFlag.close(); }, 5000);
			// }
			// });
    });

})(AJS.$ || jQuery);

var CurrentRepository = "";
var ConfluenceBaseURL = "";
var RepositoryIdsList = "";
var CheckStatus = true;

function getProlaborateRepositories(selectedId){
	try{
		var url = AJS.contextPath() + "/rest/prolaborate-admin/1.0/ProlabReps";
		AJS.$.ajax({
			url: url,
			dataType: "json"
		}).done(function(response) { // when the configuration is returned...
			if(response.d.status == "success"){
				var repositories = response.d.repositoryList;
				var optionHtml = "<option value=\"\">-->Select Repository<--</option>";
				$.each(repositories, function(index, val){
				var selected = "";
				if(typeof(selectedId) != "undefined" && selectedId != "" && val.RepositoryId == selectedId){
					selected = "selected";
				}
				else{
					selected = "";
				}
				optionHtml += "<option value = '"+val.RepositoryId+"' "+selected+">"+val.RepositoryName+"</option>";
				});
				$("#repository").html('');//RZN
				$("#repository").append(optionHtml);
				
				// $("#saveBlock").show();
				 $("#chooseRepBlock").show();
				// $("#cancelBlock").hide();
			}
			else{
			//alert("Error on connecting to prolaborate server.");
			}
		});
	}catch(e){
		
	}	
}
var DefaultRepositorychecked = "";
function connectProlaborate() {
	try {
		var serverVal = AJS.$("#server").attr("value");
		if (typeof (serverVal) == "undefined" || serverVal == "" || serverVal == null) {
			var myFlag = AJS.flag({
				type: 'error',
				body: 'Invalid Server Name.',
			});
			setTimeout(function () { myFlag.close(); }, 5000);
			return;
		}
		var url = AJS.contextPath() + "/rest/prolaborate-admin/1.0/ProlConnect";
		AJS.$.ajax({
			url: url,
			type: "POST",
			contentType: "application/json",
			data: '{ "protocol": "' + AJS.$("#protocol").attr("value") + '", "server": "' + AJS.$("#server").attr("value") + '", "port": "' + AJS.$("#port").attr("value") + '", "token": "' + AJS.$("#token").attr("value") + '", "userid": "' + AJS.$("#userid").attr("value") + '", "repositoryId": "' + AJS.$("#repository").val() + '" }',
			dataType: "json"
		}).done(function (response) { // when the configuration is returned...
			if (response != "undefined" && response != null) {
				if (response.d.status == "success") {
					var repositories = response.d.repositoryList;
					var optionHtml = "";
					if (typeof (repositories) != "undefined" && repositories != null && repositories.length > 0) {
						$.each(repositories, function (index, val) {
							var Status, Statusclass, disabled, IncludedRepositoryChecked, CheckBoxDiabled;
							Status = Statusclass = disabled = IncludedRepositoryChecked = CheckBoxDiabled = "";
							if (typeof (RepositoryIdsList) == "undefined" || RepositoryIdsList == '') {
								RepositoryIdsList = CurrentRepository;
							}
							if (val.RepositoryIsEnabled == "true") {
								if (val.IsRepositoryShareEnabled == "true") {
									Status = "Active";
									Statusclass = "bg-grad-success";
								} else {
									Status = "Repository Share Disabled <a href=\"https://prolaborate.sparxsystems.com/faqs/confluence-integration/configuring-the-macro#settings-disabled-in-manage-repositories \" target=\"_blank\"><i class=\"fa fa-info-circle\"></i></a>";
									Statusclass = "bg-grad-warning";
									CheckBoxDiabled = "disableWrap";
								}
							} else {
								Status = "Inactive";
								Statusclass = "bg-grad-danger";
								CheckBoxDiabled = "disableWrap";
							}
							if (typeof (CurrentRepository) != "undefined" && CurrentRepository != "" && val.RepositoryId == CurrentRepository && val.RepositoryIsEnabled == "true" && val.IsRepositoryShareEnabled == "true") {
								DefaultRepositorychecked = "checked";
								disabled = "disableWrap";
							} else {
								DefaultRepositorychecked = "";
							}
							if (typeof (CurrentRepository) != "undefined" && CurrentRepository != "" && (RepositoryIdsList.indexOf(val.RepositoryId) != -1) && val.RepositoryIsEnabled == "true" && val.IsRepositoryShareEnabled == "true") {
								IncludedRepositoryChecked = "checked";
							}
							optionHtml += "<div class=\"RepositoryInfo ToolTip " + Statusclass + "\">";
							optionHtml += "<div class=\"RepHead\"> <span class=\"RepName ToolTip\" title='" + val.RepositoryName + "'>" + val.RepositoryName + "</span> </div>";
							optionHtml += "<div class=\"RepBody\">";
							optionHtml += "<div class=\"DefaultRepo " + CheckBoxDiabled + "\"><span><input type=\"checkbox\" class=\"js-switch DefaultRepository\" " + DefaultRepositorychecked + " data-repname='" + val.RepositoryName + "' data-repid='" + val.RepositoryId + "'></span> Set as Default</div>";
							optionHtml += "<div class=\"IncludedRepo " + disabled + " " + CheckBoxDiabled + "\"><span><input type=\"checkbox\" class=\"js-switch IncludedRepository \" " + IncludedRepositoryChecked + "  data-repid='" + val.RepositoryId + "'></span> Include in Repository List </div>";
							optionHtml += "</div>";
							optionHtml += "<div class=\"RepFoot\"> " + Status + " </div>";
							optionHtml += "</div>";
						});
					} else {
						optionHtml += "<div class=\"RepositoryInfo ToolTip bg-grad-warning\">";
						optionHtml += "<div class=\"RepHead\"> <span> No Repository Found </span> </div>";
						optionHtml += "<div class=\"RepBody\">";
						optionHtml += "<div class=\"DefaultRepo\"> No repository added yet! <br> No repository configured to the User Id </div>";
						optionHtml += "</div>";
						optionHtml += "</div>";
					}
					
					AJS.$(".RepositoryList").html('');//RZN
					AJS.$(".RepositoryList").append(optionHtml);
					ActiveSwitchery();
					$("#saveBlock").show();
					$("#chooseRepBlock").show();
					$("#cancelBlock").hide();
					$("#editButton").show();

					$("#protocol").attr('disabled', true);
					$("#server").attr('disabled', true);
					$("#port").attr('disabled', true);
					$("#token").attr('disabled', true);
					$("#userid").attr('disabled', true);


					var myFlag = AJS.flag({
						type: 'success',
						body: 'Connection Successful.',
					});

					setTimeout(function () { myFlag.close(); }, 5000);
				}
				else if (response.d.status.toLowerCase() == "failure") {
					var Error = "";
					var Title = "";
					if (typeof (response.d.LicenseErrorKey) != "undefined" && response.d.LicenseErrorKey != null && response.d.LicenseErrorKey != "") {
						if (response.d.LicenseErrorKey == "OCA_FAIL") {
							Error = 'Model contents that will be available in Confluence is based on Access Permissions of this user. Learn more <a href=\"https://prolaborate.sparxsystems.com/faq/confluence-integration/configuring-the-macro#not-able-to-connect-the-prolaborate \" target=\"_blank\">here</a>';
							Title = "Enter User Id";
							var ErrorFlag = AJS.flag({
								type: 'error',
								title: Title,
								body: Error,
							});
							setTimeout(function () { ErrorFlag.close(); }, 5000);
						}
						if (response.d.LicenseErrorKey == "INTG_FAIL") {
							Error = 'It looks like you don’t have access to Confluence Integration feature! Upgrade to Large Teams edition or purchase Integrations add-on to get access. Learn more <a href=\"https://prolaborate.sparxsystems.com/faq/confluence-integration/configuring-the-macro#not-able-to-connect-the-prolaborate \" target=\"_blank\">here</a>';
							Title = 'Upgrade License';
							var ErrorFlag = AJS.flag({
								type: 'error',
								title: Title,
								body: Error,
							});
							setTimeout(function () { ErrorFlag.close(); }, 5000);
						}
					} else {
						Error = "Please check whether the User ID is available in Prolaborate. Learn more <a href=\"https://prolaborate.sparxsystems.com/faq/confluence-integration/configuring-the-macro#not-able-to-connect-the-prolaborate \" target=\"_blank\">here</a>";
						Title = "Not able to connect to Prolaborate";
						var ErrorFlag = AJS.flag({
							type: 'error',
							title: Title,
							body: Error,
						});
						setTimeout(function () { ErrorFlag.close(); }, 5000);
                    }
					
				}
			}
			else {
				var ErrorFlag = AJS.flag({
					type: 'error',
					title: 'Not able to connect to Prolaborate',
					body: 'Please check whether the details such as Protocol, Server Name, and Port are valid.Learn more <a href =\"https://prolaborate.sparxsystems.com/faq/confluence-integration/configuring-the-macro#not-able-to-connect-the-prolaborate \" target=\"_blank\">here</a>'
				});
				setTimeout(function () { ErrorFlag.close(); }, 5000);
			}
		}).fail(function (jqXHR, textStatus, errorThrown) {
			var ErrorMsg = '';
			var Title = '';
			if (jqXHR.status == "403") {
				ErrorMsg = "Token needs to be provided if you have enabled access restrictions in Prolaborate. Please check Application Access settings page.  Learn more <a href=\"https://prolaborate.sparxsystems.com/faq/confluence-integration/configuring-the-macro#enter-security-token \" target=\"_blank\">here</a>";
				Title = "Enter Security Token";
				var ErrorFlag = AJS.flag({
					type: 'error',
					title: Title,
					body: ErrorMsg,
				});
				setTimeout(function () { ErrorFlag.close(); }, 5000);
			} else {
				ErrorMsg = 'Please check whether the details such as Protocol, Server Name, and Port are valid.Learn more <a href =\"https://prolaborate.sparxsystems.com/faq/confluence-integration/configuring-the-macro#not-able-to-connect-the-prolaborate \" target=\"_blank\">here</a>';
				Title = 'Not able to connect to Prolaborate';
				var ErrorFlag = AJS.flag({
					type: 'error',
					title: Title,
					body: ErrorMsg,
				});
				setTimeout(function () { ErrorFlag.close(); }, 5000);
            }			
		});
	}
	catch (e) {
		//alert(e);
	}
}

function updateConfig() {
	var serverVal = AJS.$("#server").attr("value");
	var portVal = AJS.$("#port").attr("value");
	var repositoryVal = "";
	var RepositoryIdsListUpdate = "";
	CurrentRepository = repositoryVal;
	var DefaultRepositoryName = "";

	var CheckBox = AJS.$(".DefaultRepository");
	var CheckBoxCount = CheckBox.length;
	for (var i = 0; i < CheckBoxCount; i++) {
		if (CheckBox[i].checked == true) {
			repositoryVal = CheckBox[i].attributes["data-repid"].value;
			DefaultRepositoryName = CheckBox[i].attributes["data-repname"].value;
		}
	}

	var IncludedRepositoryCheckBox = AJS.$(".IncludedRepository");
	var IncludedRepositoryCheckBoxCount = IncludedRepositoryCheckBox.length;
	for (var i = 0; i < IncludedRepositoryCheckBoxCount; i++) {
		if (IncludedRepositoryCheckBox[i].checked == true) {
			if (RepositoryIdsListUpdate == "")
				RepositoryIdsListUpdate += CheckBox[i].attributes["data-repid"].value;
			else
				RepositoryIdsListUpdate += "," + CheckBox[i].attributes["data-repid"].value + "";
		}
	}

	if (typeof (serverVal) == "undefined" || serverVal == "" || serverVal == null) {
		var myFlag = AJS.flag({
			type: 'error',
			body: 'Invalid Server Name.',
		});
		setTimeout(function () { myFlag.close(); }, 5000);
		return;
	}
	else if (typeof (repositoryVal) == "undefined" || repositoryVal == "" || repositoryVal == null) {
		ErrorMsg = 'Please select any repository. Learn more <a href=\"https://prolaborate.sparxsystems.com/faqs/confluence-integration/configuring-the-macro#select-default-repository \" target=\"_blank\">here</a>';
		Title = 'Select Default Repository.';
		var ErrorFlag = AJS.flag({
			type: 'error',
			title: Title,
			body: ErrorMsg,
		});
		setTimeout(function () { ErrorFlag.close(); }, 5000);
		return;
	}
	else {
		AJS.$.ajax({
			url: AJS.contextPath() + "/rest/prolaborate-admin/1.0/",
			type: "PUT",
			contentType: "application/json",
			data: '{ "protocol": "' + AJS.$("#protocol").val() + '", "server": "' + AJS.$("#server").attr("value") + '", "port": "' + AJS.$("#port").attr("value") + '", "token": "' + AJS.$("#token").attr("value") + '", "userid": "' + AJS.$("#userid").attr("value") + '", "repositoryId": "' + repositoryVal + '","repositoryIdsList": "' + RepositoryIdsListUpdate + '" }',
			processData: false
		}).done(function (response) {
			var myFlag = AJS.flag({
				type: 'success',
				body: 'Configuration details updated.',
			});
			setTimeout(function () { myFlag.close(); }, 5000);

			$("#saveBlock").hide();
			$("#editButton").show();
			$("#chooseRepBlock").hide();
			CurrentRepository = repositoryVal;
			RepositoryIdsList = RepositoryIdsListUpdate;

			$("#protocol").attr('disabled', true);
			$("#server").attr('disabled', true);
			$("#port").attr('disabled', true);
			$("#token").attr('disabled', true);
			$("#userid").attr('disabled', true);
			$("#repository").attr('disabled', true);

			$("#cancelBlock").hide();
		});
	}

}


function ActiveSwitchery() 
{
	try {
		var ActiveState = Array.prototype.slice.call(document.querySelectorAll('.js-switch'));
		ActiveState.forEach(function (html) {
			var switchVal = html.checked;
			if (switchVal == true) {
				$(this).attr('data-switch', 1);
			} else {
				$(this).attr('data-switch', 0);
			}
			var init = new Switchery(html, { size: 'small', secondaryColor: '#CCC' });
		});
	} catch (e) {
		console.log(e);
		alert(e);
	}
}

// Active Switch Change Event 
AJS.$(document).on('change', '.DefaultRepository', function () { // changed check box into switchery -DJ -V1.11
	try {
		if (CheckStatus == true) {
			var $switchVal = $(this).is(':checked');
			var DefaultRepo = $(".DefaultRepository");
			var CurrentElement = $(this);
			var UncheckElement;
			$.each(DefaultRepo, function (key, Item) {
				var IsChkd = Item.checked;
				var CurrentItem = $(Item);
				if (IsChkd == true && CurrentItem[0] != CurrentElement[0]) {
					CheckStatus = false;
					UncheckElement = Item;
				}
			});
			if ($switchVal == true) {
				$(this).attr('data-switch', 1);
				$(this).attr('checked', 'checked');
				$(this).parent().parent().siblings().addClass("disableWrap");
				var element = $(this).parent().parent().siblings().children().children()[0];
				if (element.checked == false) {
					$(element).trigger("click");
				}
			} else {
				$(this).attr('data-switch', 0);
				$(this).removeAttr('checked');
				$(this).parent().parent().siblings().removeClass("disableWrap");
			}
		} else {
			$(this).parent().parent().siblings().removeClass("disableWrap");
			CheckStatus = true;
		}
		if (CheckStatus == false)
			$(UncheckElement).trigger("click");
	} catch (e) {
		console.log(e);
	}
});