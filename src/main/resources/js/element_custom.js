$(function () {
    $.xhrPool = [];
    $.xhrPool.abortAll = function () {
        $(this).each(function (i, jqXHR) {   //  cycle through list of recorded connection
            jqXHR.abort();  //  aborts connection
            $.xhrPool.splice(i, 1); //  removes from list by index
        });
    }
});
var viewData = {
    viewList: {
        wrap: '.childrenElementList',
        trigger: '.childrenViewList'
    },
    viewTable: {
        wrap: '.childrenElementTable',
        trigger: '.childrenViewTable'
    }
};

//Adjust I-Frame height -Dj -v1.8
var IframeRandomId = "";

$(document).ready(function () {
    try {
        if (typeof (elementType) != "undefined" && elementType != "Diagram") {            
            IframeRandomId = Prol_IframeId;
            setWindowHeight();
            // Switchery
            activateSwitchery();

            // Tooltip
            //addToolTip();
            //var elementType = $("pageElement").val();
            GetELementInfo(elementId, elementType, repositoryId, "callBackGetElementInfo");

            var includeRecursive = $(".includeRecursiveCheck").prop('checked');
            var elementTraceabilityDetails = $('#elementTraceabilityDetails');
            if (typeof (elementTraceabilityDetails) != "undefined" && elementTraceabilityDetails.length != 0) { LoadChildrenArtifacts(repositoryId, elementId, elementType, includeRecursive); }

            $(".ProlaborateImageClass").attr("style", "background: url(" + requestURL + "/Assets/Images/ExternalApp/Logo/prolaborate.png) no-repeat left transparent;background-size:72px 72px");
        }
        //AJS.$("#includeRecursiveCheckWrap").tooltip({ gravity: 'w' });
    } catch (e) {
        console.log(e);
    }
});

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

// -----------------------------------
// Event
// -----------------------------------

// switch View
$(document).on('click', viewData.viewTable.trigger, function () {
    switchElementView('table');
});
$(document).on('click', viewData.viewList.trigger, function () {
    switchElementView('list');
});

// Collapse
$(document).on('click', '.childrenGroupingCollapse .childrenGroupingValue', function () { childrenGroupingCollapse($(this)); });

//$(document).on('click', 'a', function (e) {
// var href = $(this).attr('href');
// var hrefT = $(this).attr('target');
// var isHref = (typeof href != 'undefined' && href != null && href != '' && href != "javascript:void(0);" && href != "javascript:void(0)");
// var isHrefT = (typeof hrefT != 'undefined' && hrefT != null && hrefT != '');

// if(isHref) {
// var isHost = getUrlHost(href);
// var isParam = getUrlParameter(href, 'showTable'); // 'showTable' - parameter name

// if (isHost == 'localhost') {
// if (isParam == '0') {
// var hrefTarget = isHrefT ? hrefT : '_blank';

// window.open(href, hrefTarget);
// } else {
// e.preventDefault();
// }
// } else {
// e.preventDefault();
// }
// }
//});


// -----------------------------------
// fn
// -----------------------------------

// Tooltip Control
function addToolTip() {
    // var IsTouch = 'ontouchstart' in window || navigator.maxTouchPoints;
    // IsTouch ? '' : $('[data-toggle="tooltip"]').tooltip();
}

// switch View
function switchElementView(method) {
    switch (method) {
        case 'list':
            $(viewData.viewList.trigger).addClass('disabled');
            $(viewData.viewTable.trigger).removeClass('disabled');

            // Update UI
            $(viewData.viewList.wrap).show();
            $(viewData.viewTable.wrap).hide();
            break;
        case 'table':
            $(viewData.viewList.trigger).removeClass('disabled');
            $(viewData.viewTable.trigger).addClass('disabled');

            // Update UI
            $(viewData.viewList.wrap).hide();
            $(viewData.viewTable.wrap).show();
            break;
        default:
            break;
    }
}

// Collapse
function childrenGroupingCollapse(target) {
    target.closest('.childrenGroupingCollapse').toggleClass('open');
}

// Switchery
function activateSwitchery() {
    var ActiveState = Array.prototype.slice.call(document.querySelectorAll('.js-switch'));

    ActiveState.forEach(function (html) {
        var init = new Switchery(html, { size: 'small', secondaryColor: '#CCC' });

        checkSwitch($(html));
    });
}

function checkSwitch(obj) {
    try {
        var module = obj.attr('data-module');

        switch (module) {
            case 'includeRecursiveCheck':
                break;
            default:
                break;
        }

        // Switch Status Set [On/Off] Val:
        var switchVal = obj.is(':checked');
        obj.attr('data-switch', (switchVal == true ? 1 : 0));

    } catch (e) {
        console.log(e);
    }
}

function getUrlParameter(url, sParam) {
    //var sPageURL = decodeURIComponent(window.location.search.substring(1)),
    var sPageURL = url,
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

function getUrlHost(url) {
    var sPageHost = url.replace('http://', '').replace('https://', '').split(/[/?#]/);
    return sPageHost[0].split(':')[0];
};

var elementProperties;
var elementType;

//To render Documentation, Attribute, Operation, Scenario, Constraint and EaDox Info
function GetELementInfo(elementGuid, elementType, repositoryId, ajaxCallBackMethod) {
    // var data = "{elementGuid:'" + elementGuid + "', elementType:'" + elementType + "', RepositoryId:'" + repositoryId + "', UserId:'" + userId + "', GetChildren:false}";
    //handleAjaxRequest(null, true, "API/Method.aspx/GetElementProperties", data, "callBackGetElementInfo");
    try {
        var url1 = "/rest/prolaborate-admin/1.0/ProlabElementProperties";
        var data = '{"repositoryId":"' + repositoryId + '", "Guid":"' + elementGuid + '", "ElementType":"' + elementType + '"}';
        handleAjaxRequest(null, true, url1, data, "callBackGetElementInfo");
    } catch (e) {
        console.log(e);
    }
}
function callBackGetElementInfo(responseData) {
    try {
        if (responseData.d.status == "success") {
            if (typeof (responseData.d.elementProperties) != "undefined") {

                //Get Notes
                var elementDescription = $(".overviewSummary");

                elementDescription.html((responseData.d.elementProperties.Notes.trim() == '') ? 'Not Set' : '<iframe id="iframeNotes"></iframe>');

                setTimeout(function () {
                    if (responseData.d.elementProperties.Notes.trim() != '') {

                        var iFrameContent = '';
                        iFrameContent += '<style type="text/css">html, body { margin:0; padding:0; } body { font:13px arial; color:#333; }</style>';
                        iFrameContent += responseData.d.elementProperties.Notes.replace(/(\r\n)/g, "<br>").replace(/(\n)/g, "<br>").replace("\t", "").replace("'", "&acute;");
                        //iFrameContent = iFrameContent.replace("\"", "\\\"");

                        // Write to iframe
                        setTimeout(function () {
                            var $iframe = document.getElementById('iframeNotes').contentWindow.document;
                            $iframe.open();
                            $iframe.write(iFrameContent);
                            $iframe.close();
                        }, 400);

                        // Bind iframe event.
                        iframeLoaded('iframeNotes', repositoryId);
                    }
                }, 200);

                //$(".overviewSummary").html(responseData.d.elementProperties.Notes);
            }

            //Get Constraints..
            try {
                if (typeof (responseData.d.elementConstraints) != "undefined" && responseData.d.elementConstraints != null && $(responseData.d.elementConstraints).length > 0) {
                    var constraintItems = $(responseData.d.elementConstraints);
                    //Build scenario list with template.

                    var constraintItemsHtml;
                    $(constraintItems).each(function (key, obj) {
                        constraintItemsHtml = '<div class="scenarioItem">';
                        constraintItemsHtml += '<div class="scenarioLeft">';
                        constraintItemsHtml += '<div class="scenarioTitle" data-guid="' + obj.Guid + '" data-type="' + obj.Type + '">';
                        constraintItemsHtml += '<i class="fa fa-link"></i>&nbsp; ' + obj.Name + '';
                        constraintItemsHtml += '<a href="javascript:void(0);" class="scenarioComment" data-guid="' + elementId + '::' + obj.Guid + '"  style="display:none;" ><i class="fa fa-comments"></i></a>';
                        constraintItemsHtml += '</div>';
                        constraintItemsHtml += '<table>';
                        constraintItemsHtml += '<tbody>';
                        constraintItemsHtml += '<tr><td style="width:100px;"><b>Type</b></td><td style="width:10px;">:</td><td>' + obj.Type + '</td></tr>';
                        constraintItemsHtml += '<tr><td><b>Status</b></td><td>:</td><td>' + obj.Status + '</td></tr>';
                        constraintItemsHtml += '<tr><td><b>Notes</b></td><td>:</td><td>' + obj.Notes + '</td></tr>';
                        constraintItemsHtml += '</tbody>';
                        constraintItemsHtml += '</table>';
                        constraintItemsHtml += '</div>';
                        constraintItemsHtml += '</div>';
                    });
                    if (typeof (constraintItemsHtml) != "undefined" && $(constraintItemsHtml).length > 0) {
                        $(".constraintGroup").show();
                        $(".ConstraintItemsListGroup").html(constraintItemsHtml);
                    }
                }
            } catch (e) {

            }


            //Get Scenarios..
            try {
                if (typeof (responseData.d.elementScenarios) != "undefined" && responseData.d.elementScenarios != null && $(responseData.d.elementScenarios).length > 0) {
                    var scenarioItems = $(responseData.d.elementScenarios);
                    //Build scenario list with template.

                    var scenarioItemsHtml;
                    $(scenarioItems).each(function (key, obj) {
                        scenarioItemsHtml = '<div class="scenarioItem">';
                        scenarioItemsHtml += '<div class="scenarioLeft">';
                        scenarioItemsHtml += '<div class="scenarioTitle" data-guid="' + obj.Guid + '" data-type="' + obj.Type + '">';
                        scenarioItemsHtml += '' + obj.Name + ' <a href="javascript:void(0);" class="scenarioComment" data-guid="' + elementId + '::' + obj.Guid + '"  style="display:none;" ><i class="fa fa-comments"></i></a>';
                        scenarioItemsHtml += '</div>';
                        scenarioItemsHtml += '</div>';
                        scenarioItemsHtml += '<div class="scenarioRight">';
                        scenarioItemsHtml += '<div class="scenarioDetails">';
                        scenarioItemsHtml += '<p>' + obj.Notes + '</p>';
                        if (obj.Steps.length > 0) {
                            scenarioItemsHtml += '<ol>';
                            $(obj.Steps).each(function (key, step) {
                                var stepicon = "";
                                if (step.Type == 'stActor') { stepicon = "pbicon-scenarioStepUserAction"; }
                                else if (step.Type == 'stSystem') { stepicon = "pbicon-scenarioStepSystemAction"; }
                                scenarioItemsHtml += '<li data-icon="' + stepicon + '"';
                                scenarioItemsHtml += 'data-guid="' + step.Guid + '" data-type="' + step.Type + '">' + step.Name + '&nbsp;<a href="javascript:void(0);" class="scenarioComment" ';
                                scenarioItemsHtml += 'data-guid="' + elementId + '::' + obj.Guid + '::' + step.Guid + '"style="display:none;"><i class="fa fa-comments">';
                                scenarioItemsHtml += '</i></a></li>';
                            });
                            scenarioItemsHtml += '</ol>';
                        }
                        scenarioItemsHtml += '</div>';
                        scenarioItemsHtml += ' </div>';
                        scenarioItemsHtml += '</div>';
                    });
                    if (typeof (scenarioItemsHtml) != "undefined" && $(scenarioItemsHtml).length > 0) {
                        $(".scenarioGroup").show();
                        $(".ScenarioItemsListGroup").html(scenarioItemsHtml);

                    }
                }
            } catch (e) {

            }

            //Get Attributes..
            try {
                if (typeof (responseData.d.elementAttributes) != "undefined" && responseData.d.elementAttributes != null && $(responseData.d.elementAttributes).length > 0) {
                    var AttributesItems = $(responseData.d.elementAttributes);
                    //Build scenario list with template.
                    var gp = $(".AttributesGroup");
                    if (typeof (responseData.d.attributeContent) != "undefined" && $(responseData.d.attributeContent).length > 0) {
                        $(".AttributesGroup").show();
                        $(".BType").text(responseData.d.elementProperties.BaseType);
                        $(".AttributesItemsListGroup").html($(responseData.d.attributeContent));

                    }
                }
                $('.viewAttributeDetail').attr('style', '');
            } catch (e) {

            }

            //Get Operations..
            try {
                if (typeof (responseData.d.elementOperations) != "undefined" && responseData.d.elementOperations != null && $(responseData.d.elementOperations).length > 0) {
                    var OperationItems = $(responseData.d.elementOperations);
                    //Build scenario list with template.

                    if (typeof (responseData.d.operationContent) != "undefined" && $(responseData.d.operationContent).length > 0) {
                        $(".OperationsGroup").show();
                        $(".BType").text(responseData.d.elementProperties.BaseType);
                        $(".OperationsItemsListGroup").html($(responseData.d.operationContent));
                    }
                }
                $('.viewAttributeDetail').attr('style', '');
            } catch (e) {

            }

            //Get EADocx Docs List..
            try {
                if (typeof (responseData.d.eaDocxDocumentList) != "undefined" && responseData.d.eaDocxDocumentList != null && $(responseData.d.eaDocxDocumentList).length > 0) {

                    htmlstring = "";
                    htmlstring += "<div class=\"childrenGroupingList\">";
                    htmlstring += "<table class=\"table\">";
                    htmlstring += "<thead>";
                    htmlstring += "<tr>";
                    htmlstring += "<th>Name</th>";
                    htmlstring += "<th>Author</th>";
                    if ((typeof responseData.d.allowDownload != "undefined" && responseData.d.allowDownload == true) || (typeof responseData.d.allowView != "undefined" && responseData.d.allowView == true)) {
                        htmlstring += "<th class=\"text-center\" style=\"width: 300px;\">Action</th>";
                    }
                    htmlstring += "</tr>";
                    htmlstring += "</thead>";
                    htmlstring += "<tbody>";
                    $(responseData.d.eaDocxDocumentList).each(function (key, obj) {
                        htmlstring += "<tr>";
                        htmlstring += "<td><i class=\"pbicon pbicon-Extended_documentVersion\"></i>&nbsp;" + obj.Name;
                        if (responseData.d.latestVersion == obj.Version) {
                            htmlstring += "&nbsp;<label class=\"label label-success\">Latest Version</label>";
                        }
                        htmlstring += "</td>";
                        if (obj.Author != "") {
                            htmlstring += "<td><i class=\"fa fa-user\"></i>&nbsp;" + obj.Author + "</td>";
                        } else {
                            htmlstring += "<td>Not Set</td>";
                        }
                        htmlstring += "<td class=\"text-center\">";
                        if ((typeof responseData.d.allowDownload != "undefined" && responseData.d.allowDownload == true) || (typeof responseData.d.allowView != "undefined" && responseData.d.allowView == true)) {
                            if (typeof responseData.d.allowDownload != "undefined" && responseData.d.allowDownload == true) {
                                htmlstring += "<a href=\"javascript:void(0);\" class=\"btn btn-theme DownloadEADocxDocument\" data-guid=\"" + obj.Guid + "\">Download</a>&nbsp;";
                            }
                            if (typeof responseData.d.allowView != "undefined" && responseData.d.allowView == true) {
                                htmlstring += "<a href=\"javascript:void(0);\" class=\"btn btn-theme ViewEADocxDocument\" data-guid=\"" + obj.Guid + "\">View</a>&nbsp;";
                            }
                            htmlstring += " </td>";
                        }
                        htmlstring += "</tr>";
                    });
                    htmlstring += "</tbody>";
                    htmlstring += "</table>";
                    htmlstring += "<div>&nbsp;</div>";
                    htmlstring += " </div>";
                    $(".eaDocxGroupingList").html(htmlstring);
                    $(".eaDocxGrouping").show();
                } else {

                }
            } catch (e) {
                $(".eaDocxGrouping").hide();
                //alert(e);
            }
        }
    } catch (e) {
        console.log(e);
    }
}

function iframeLoaded(iframeId, repID) {
    try {
        $('body iframe#' + iframeId).load(function () {
            $('body iframe').contents().find('a').bind('click', function (e) {
                e.preventDefault();
                var url = "";
                var itemGUID = "";
                var itemType = $(this).attr("href").split("//")[0];

                switch (itemType) {
                    case "$package:": itemGUID = $(this).attr("href").replace("$package://", ""); break;
                    case "$element:": itemGUID = $(this).attr("href").replace("$element://", ""); break;
                    case "$diagram:": itemGUID = $(this).attr("href").replace("$diagram://", ""); break;
                    case "$inet:": itemGUID = $(this).attr("href").replace("$inet://", ""); break;
                    default: itemGUID = "javascript:void(0);"; break;
                }
                if (itemType == "$package:" || itemType == "$element:" || itemType == "$diagram:") {
                    url = requestURL + "/Repository" + "/Artifact.aspx?repId=" + repID + "&procId=" + itemGUID + "&tb=overview"; // fixed url issue -DJ
                    window.open(url);
                } else {
                    url = itemGUID;
                    if (itemGUID == "javascript:void(0);") {
                        return false;
                    } else {
                        window.open(url);
                    }
                }
                return false;
            });
        });
    } catch (e) {
        console.log(e);
    }
}

var ColFilterPreFix = "CFT-";
var CallSelectedChild = true;
var CurPosReorder = "";
var searchkey = "";
var childrenListTable = "";
var ChildrenDisplayLength = 10;
var displayStart = 0;
var queries = {};
var ArtifactIsUpdated = 0;

//To get Children table
function LoadChildrenArtifacts(repositoryId, elementId, elementType, includeRecursive) {

    //var data = "{repositoryId:'" + repositoryId + "', ElementGuid:'" + elementId + "', ElementType:'" + elementType + "', includeRecursive:" + includeRecursive + "}";
    //handleAjaxRequest(null, true, "API/Request.aspx/GetArtifactsAPI", data, "CallBackGetArtifacts1");
    try {
        var url1 = "/rest/prolaborate-admin/1.0/ProlabGetArtifacts";
        var data = '{"repositoryId":"' + repositoryId + '", "Guid":"' + elementId + '", "ElementType":"' + elementType + '", "parentguids":"' + parentguids + '", "IncludeRecursive": ' + includeRecursive + '}';
        handleAjaxRequest(null, true, url1, data, "CallBackGetArtifacts1");
    } catch (e) {
        console.log(e);
    }
}

function CallBackGetArtifacts1(responseData) {
    try {
        //finLoading(".pdOverview");
        //finLoading(".childrenElementList");
        if (responseData.d.status == 'success') {

            setWindowHeight();
            if (responseData.d.GroupProperties['All - All'].count > 0) {
                $(".elementTraceabilityDetails").removeClass("hidden");
                $(".childrenGrouping").removeClass("hidden");
            }
            else { return false; }


            //Build table for datatable. 
            groupedArtifacts = responseData.d;
            //var ColumnKeys = groupedArtifacts.GroupProperties[Object.keys(responseData.d.Groups)[0]];
            //var ListItems = groupedArtifacts.Groups[Object.keys(responseData.d.Groups)[0]];
            //var renderData = { 'Properties': responseData.d.Properties, 'ListItem': responseData.d.Groups[Object.keys(responseData.d.Groups)[0]] };

            //Group items.
            //var groupsList = Object.keys(responseData.d.Groups);
            var groupsListGrouping = {};
            groupPropertiesObject = {};
            if (typeof (responseData.d.GroupProperties) != "undefined" && Object.keys(responseData.d.GroupProperties).length > 0) {
                //Sorting list by alphabetical order.
                Object.keys(responseData.d.GroupProperties).sort().forEach(function (key) {
                    groupPropertiesObject[key] = responseData.d.GroupProperties[key];
                });
                groupsListGrouping["All"] = {};
                groupsListGrouping["Package"] = {};
                groupsListGrouping["Element"] = {};
                groupsListGrouping["Diagram"] = {};

                $.each(groupPropertiesObject, function (key, obj) {
                    if (typeof (key) != "undefined") {
                        if (key.indexOf(' - All') > -1) {
                            var groupKey = key;
                            var groupName = key.replace(" - All", "") + " (" + obj.count + ")";
                            groupsListGrouping["All"][groupKey] = groupName;
                        } else if (key.indexOf(' - Package') > -1) {
                            var groupKey = key;
                            var groupName = key.replace(" - Package", "") + " (" + obj.count + ")";
                            groupsListGrouping["Package"][groupKey] = groupName;
                        }
                        else if (key.indexOf(' - Diagram') > -1) {
                            var groupKey = key;
                            var groupName = key.replace(" - Diagram", "") + " (" + obj.count + ")";
                            groupsListGrouping["Diagram"][groupKey] = groupName;
                        }
                        else {
                            var groupKey = key;
                            var groupName = key.replace(" - Element", "") + " (" + obj.count + ")";
                            groupsListGrouping["Element"][groupKey] = groupName;
                        }
                    }
                });
                var groupItemsHtml = "";
                if (typeof (groupsListGrouping) != "undefined") {
                    $.each(groupsListGrouping, function (optGrpName, optGrps) {
                        if (typeof (optGrps) != "undefined" && Object.keys(optGrps).length > 0) {
                            groupItemsHtml += '<optgroup label="' + optGrpName + '">';
                            $.each(optGrps, function (key, obj) {
                                groupItemsHtml += "<option value='" + key + "'>" + obj + "</option>";
                            });
                            groupItemsHtml += '</optgroup>';
                        }
                    });
                }
                $(".groupArtifacts").html(groupItemsHtml);

                //Default Selection 
                $('.groupArtifacts option[value="All - All"]').prop("selected", true);
                $('.groupArtifacts option[value="All - All"]').attr('selected', 'selected');

                var value = $(".groupArtifacts").val();
                //console.log(value);
                //if (getQueryString("childelement") != null && getQueryString("childelement") != "" && getQueryString("subpackage") > 0) {
                if (getQueryString("childelement") != null && getQueryString("childelement") != "") {
                    //CallSelectedChild = false;
                    var SelChildElement = getQueryString("childelement");
                    //value = decodeURIComponent(SelChildElement.replace(/\+/g, " "));                    
                    value = decodeUrlParam(SelChildElement);
                }
                //console.log(value);
                var ColumnKeys = groupPropertiesObject[value]["columns"];

                //GetTabaleColumnsByGroupKey
                //var elementId = $("#elementId").val();
                var includeRecursive = $(".includeRecursiveCheck").prop('checked');
                //var ReqData = "{repositoryId:'" + repositoryId + "', ElementGuid:'" + elementId + "', ElementType:'" + elementType + "', includeRecursive:" + includeRecursive + ", GroupKey:'" + value + "'}";
                //handleAjaxRequest(null, true, "API/Request.aspx/GetTabaleColumnsByGroupKeyAPI", ReqData, "CallBackGetTabaleColumnsByGroupKey");

                var url1 = "/rest/prolaborate-admin/1.0/ProlabGetTabaleColumnsByGroupKey";
                var data = '{"repositoryId":"' + repositoryId + '", "Guid":"' + elementId + '", "ElementType":"' + elementType + '", "IncludeRecursive":' + includeRecursive + ', "GroupKey":"' + value + '"}';
                handleAjaxRequest(null, true, url1, data, "CallBackGetTabaleColumnsByGroupKey");
            }
        }
        else {

        }
    }
    catch (e) { //alert(e);
    }
}

function CallBackGetTabaleColumnsByGroupKey(responseData) {
    //console.log(responseData);
    //finLoading(".childrenElementList");
    try {
        if (responseData.d.status == 'success') {
            if (typeof (responseData.d.GroupProperties) != "undefined" && Object.keys(responseData.d.GroupProperties).length > 0) {
                //Sorting list by alphabetical order.
                setWindowHeight();
                Object.keys(responseData.d.GroupProperties).sort().forEach(function (key) {
                    groupPropertiesObject[key] = responseData.d.GroupProperties[key];
                });
                var value = $(".groupArtifacts").val();

                //if (getQueryString("childelement") != null && getQueryString("childelement") != "" && getQueryString("subpackage") > 0) {
                if (getQueryString("childelement") != null && getQueryString("childelement") != "") {
                    //CallSelectedChild = false;
                    var SelChildElement = getQueryString("childelement");
                    //value = decodeURIComponent(SelChildElement.replace(/\+/g, " "));                    
                    value = decodeUrlParam(SelChildElement);
                }
                //console.log(value);
                var ColumnKeys = groupPropertiesObject[value]["columns"];

                updateArtifactList(ColumnKeys);
            }
        } else {

        }
    } catch (e) {
        console.log(e);
    }
}

function updateArtifactList(ColumnKeys) {
    //console.log(CurPosReorder);
    //initLoader(".childrenElementList");
    //console.log(ColumnKeys);
    try {
        var dataColShowHideWrap = $('#dataColShowHide');
        var dataColShowHideOption;

        var tableWrap = $(".childrenTable .childrenListTable");

        var tableHtml = '<table id="childrenList" style="width:100%;" class="dataList cell-border compact nowrap">';
        tableHtml += '<thead class="dataListHeader">';
        tableHtml += '<tr class="dataListItem">';
        // tableHtml += '<th>&nbsp;</th>';
        var tableCoulumn = [];
        var tableFootHtml = "";

        // Adding Theme Column
        tableHtml += '<th data-colid="ItemDrag" class="dataItemDrag"></th>';
        tableFootHtml += '<th data-colid="ItemDrag" class="dataItemDrag"></th>';
        var dtObject = { "data": "ItemDrag", "class": "dataItemDrag", "searchable": false }
        tableCoulumn.push(dtObject);
        // Adding Theme Column Ends

        $.each(ColumnKeys, function (index, columnKey) {
            tableHtml += '<th data-colid="' + index + '">' + columnKey + '</th>';

            tableFootHtml += '<th data-colid="' + index + '">' + columnKey + '</th>';
            var dtObject = { "data": "" + index + "", "class": "" + columnKey + "" }
            tableCoulumn.push(dtObject);
            if (index != "Name") {
                // Get Column index for show hide event
                dataColShowHideOption += '<option data-tokens="' + index + '" value="' + index + '" selected="selected">' + columnKey + '</option>';
            }


        });
        tableHtml += '</tr>';
        tableHtml += '</thead>';

        tableHtml += '<tfoot style="display: table-header-group;">';
        tableHtml += '<tr>';
        tableHtml += tableFootHtml;
        tableHtml += '</tr>';
        tableHtml += '</tfoot>';

        tableHtml += '<tbody class="dataListBody">';
        tableHtml += '</tbody>';

        tableHtml += '</table>';

        //Append Table Data
        tableWrap.html(tableHtml);

        // Append Column Show Hide Option
        dataColShowHideWrap.html(dataColShowHideOption);

        //// Initiate Data Tables
        // Setup - add a text input to each footer cell
        var DefaultFilterColValues = [];
        //DtFilterColumns = [];

        $('#childrenList tfoot th').each(function (i, val) {
            var target = $(val);

            var title = target.text();
            var FilterringColumn = ColFilterPreFix + title;

            var ColDefSearchVal = decodeUrlParam(getQueryString(FilterringColumn));

            DefaultFilterColValues.push({ "sSearch": ColDefSearchVal });

            if (title != null && title != "" && typeof title != 'undefined') {
                //target.html('<input type="text" name="' + title + '" value="' + ColDefSearchVal + '" placeholder="Filter ' + title + '" />');
                target.html('<input type="text" name="' + title + '" value="' + ColDefSearchVal + '" />');
            } else if (title == "" && target.attr("data-colid") == "ItemDrag") {
                target.html('<i class="fa fa-ellipsis-v"></i>');
            }
        });

        var CurValue = $(".groupArtifacts option:selected").val();
        //if (getQueryString("childelement") != null && CallSelectedChild == true) {
        if (getQueryString("childelement") != null) {
            var SelChildElement = getQueryString("childelement");
            //CurValue = decodeURIComponent(SelChildElement.replace(/\+/g, " "));
            CurValue = decodeUrlParam(SelChildElement);
        }

        if (CurPosReorder.length > 0 && tableCoulumn.length != CurPosReorder.length) {
            CurPosReorder = "";
            delete queries.positions;
            setNewUrlParam();
        }

        try {
            childrenListTable = $('#childrenList').DataTable({
                "dom": '<"row"<"col-sm-6"l><"col-sm-6"f>><"row"<"col-sm-5"i><"col-sm-7"p>><"row dataHeightFix"<"col-sm-12"<"dataHeightFixIn"t>>>',
                //"dom": '<"row"<"col-sm-8"li><"col-sm-4"f>><"row"<"col-sm-12"rt>><"row"<"col-sm-12"p>>',
                //"sDom": "Rlfrtip",
                //CRrtip
                "processing": true,
                "serverSide": true,

                //"sScrollY": '200px',
                //"sScrollX": "100%",
                //"bScrollCollapse": true,
                //"fixedColumns": {
                //"leftColumns": 2
                //},

                "bSort": false,

                "oSearch": { "sSearch": searchkey }, //Initial Search
                "aoSearchCols": DefaultFilterColValues,
                "searchDelay": 2000,
                "columnDefs": [
                    { "searchable": false, "targets": 0 }
                ],

                "iDisplayLength": ChildrenDisplayLength, //Displaying no of rows
                "displayStart": displayStart, // (pageno - 1) * iDisplayLength

                "columns": tableCoulumn,

                "ajax": function (data, callback, settings) {
                    //var elementId = $("#elementId").val();

                    var Checkedvalue = $(".includeRecursiveCheck").prop('checked');
                    //var value = $(".groupArtifacts option:selected").val();
                    var value = CurValue;
                    var draw = data.draw;
                    var searchValue = data.search.value;
                    var startIndex = data.start;
                    var length = data.length;
                    if (draw > 1) {
                        $.xhrPool.abortAll();
                    }
                    //console.log(data.columns);
                    //var searchableColumns = {};

                    var DtFilterColumns = [];
                    //console.log(data.columns);
                    //console.log(queries);
                    $.each(data.columns, function (key, col) {
                        //console.log(col);
                        if (data.columns[key].data == col.data) {
                            if ((typeof queries[ColFilterPreFix + col.data]) != "undefined" && (queries[ColFilterPreFix + col.data]) != "") {
                                DtFilterColumns.push({ key: col.data, value: queries[ColFilterPreFix + col.data] });
                            }
                        }
                    });

                    var DtFilterColumnsString = JSON.stringify(DtFilterColumns);
                    //initLoader(".childrenElementList");

                    //var requestData = "{repositoryId:'" + repositoryId + "', ElementGuid:'" + elementId + "', ElementType:'" + elementType + "',includeRecursive: " + Checkedvalue + ",GroupKey:'" + value + "', TableDraw:" + draw + ",StartIndex:" + startIndex + ",RowLength:" + length + ",SearchValue:'" + searchValue + "', dtrepcolumns:" + 
                    //DtFilterColumnsString + "}";
                    var requestData = '{"repositoryId":"' + repositoryId + '", "Guid":"' + elementId + '", "ElementType":"' + elementType + '", "parentguids":"' + parentguids + '","IncludeRecursive": ' + Checkedvalue + ',"GroupKey":"' + value + '", "TableDraw":' + draw + ',"StartIndex":' + startIndex + ',"RowLength":' + length + ',"SearchValue":"' + searchValue + '", "dtrepcolumns":' + DtFilterColumnsString + '}';

                    var url = RequestFullUrl + "/rest/prolaborate-admin/1.0/ProlabGetChildTableHtml";
                    $.ajax({
                        async: true,
                        type: "POST",
                        url: RequestFullUrl + "/rest/prolaborate-admin/1.0/ProlabGetChildTableHtml",
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        data: requestData,
                        success: function (responseData) {
                            //finLoading(".childrenElementList");
                            if (getQueryString("fullScreen") == 1) {
                                //finLoading("body");
                            }
                            callback({
                                draw: responseData.d.draw,
                                data: responseData.d.data,
                                recordsTotal: responseData.d.recordsTotal,
                                recordsFiltered: responseData.d.recordsFiltered
                            });
                            setTimeout(function () {
                                var CurTotRec = responseData.d.data.length;
                                $.each(responseData.d.data, function (i, val) {
                                    var elementGuid = val.DT_RowId;

                                    if (childrenListTable.data().count() > 0) {
                                        var row = childrenListTable.row("#" + elementGuid);
                                    } else {
                                        var row = "";
                                    }
                                    //var data = '{"elementGuid":"' + elementGuid + '"}';
                                    //handleAjaxRequest(null, true, "API/Method.aspx/GetElementPropertiesLimited", data, "CallBackUpdateRow", row);
                                    var data = '{"repositoryId":"' + repositoryId + '", "Guid":"' + elementGuid + '"}';
                                    var url1 = "/rest/prolaborate-admin/1.0/ProlabElementPropertiesLimited";
                                    handleAjaxRequest(null, true, url1, data, "CallBackUpdateRow", row);
                                    if (CurTotRec == i + 1) {
                                        var selectedView = getQueryString("view");
                                        if (selectedView != null && selectedView == 'list') {
                                            // Children List : Scroll to Position.
                                            var parent = $('.pdOverview');
                                            var target = parent.find('.elementTraceabilityDetails');
                                            //console.log(target.position());
                                            //console.log(target.innerHeight());
                                            var targetTop = target.position().top + target.innerHeight();

                                            if (ArtifactIsUpdated == 1) {
                                                ArtifactIsUpdated = 0;
                                                parent.animate({ scrollTop: targetTop }, 400);
                                                setTimeout(function () {
                                                    //finLoading('.contentContainer');
                                                }, 410);
                                            }
                                        }
                                    }
                                })
                            }, 0);
                            //alert("Completed");
                            if (ArtifactIsUpdated == 0) {
                                //finLoading('.mainPageContent');
                            }
                            if (getQueryString("childelement") != null) {
                                //CallSelectedChild = false;
                                var SelChildElement = getQueryString("childelement");
                                //CurVal = decodeURIComponent(SelChildElement.replace(/\+/g, " "));
                                CurVal = decodeUrlParam(SelChildElement);
                                $('.groupArtifacts option[value="' + CurVal + '"]').prop("selected", true);
                                $('.groupArtifacts option[value="' + CurVal + '"]').attr('selected', 'selected');
                            }

                            var PgInfo = childrenListTable.page.info();
                            //console.log(PgInfo);
                            if (PgInfo.pages < getQueryString("curpage")) {
                                delete queries.curpage;
                                setNewUrlParam();
                            }

                        },
                        failure: function () {
                            //finLoading(".childrenElementList");

                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            //finLoading(".childrenElementList");

                        }
                    });
                },

                "initComplete": function (settings) {
                },
                "responsive": true,

            });
        } catch (e) {
            //alert(e);
        }

        //Startt
        //hartis.si/datatables/src/dataTables.colResize.js hartis.si/datatables/Examples/resize-complex-header.html
        //childrenListTable.colResize.init({ dblClick: 'autoFit', fixedLayout: false });

        //childrenListTable.colResize.init({ dblClick: 'autoFit', fixedLayout: true });
        //childrenListTable.colResize.init();

        $('.dataTables_filter input').on('keyup change', function () {
            //delete queries.curpage;
            try {
                if ($(this).val().length > 0) {
                    searchkey = $(this).val();
                    queries.searchkey = $(this).val();
                } else {
                    delete queries.searchkey;
                    searchkey = "";
                }
                setNewUrlParam();
            } catch (e) {
                console.log(e);
            }
        });

        // Apply the search
        childrenListTable.columns().every(function () {
            var that = this;
            try {
                $('input', this.footer()).on('keyup change', function (d) {
                    if (that.search() !== this.value || this.value == "") {
                        //delete queries.curpage;
                        var cColN = ColFilterPreFix + $(this).attr("name");
                        queries[cColN] = this.value;
                        if (this.value == "") {
                            delete queries[cColN];
                        }
                        setNewUrlParam();
                        that
                            .search(this.value)
                            .draw();

                    }
                });
            } catch (e) {
                console.log(e);
            }
        });

        var displayLength = $('select[name=childrenList_length]'); /*<!--  txTable is the id of my table -->*/

        displayLength.change(function (event) {
            try {
                queries.displaylength = displayLength.val();
                ChildrenDisplayLength = queries.displaylength;
                setNewUrlParam();
            } catch (e) {
                console.log(e);
            }
        });

        $('#childrenList').on('page.dt', function () {
            try {
                var info = childrenListTable.page.info();
                queries.curpage = info.page + parseInt(1);
                setNewUrlParam();
            } catch (e) {
                console.log(e);
            }
        });

        //Enddd

        // selectbox : Show Hide Col Event
        $('#dataColShowHide').selectpicker('destroy');

        // selectbox : Show Hide Col Event
        $('#dataColShowHide').selectpicker();

        // Selectbox : Update Title
        $('#dataColShowHide').closest('.bootstrap-select').find('.filter-option').html('Show/Hide Columns');
        $('#dataColShowHide').closest('.bootstrap-select').find('.dropdown-toggle').removeAttr('title');

        // Get Table Columns Count : later used for column show hide event
        iColumns = $('#childrenList thead th').length;

        $('.dataHeightFixIn').on('scroll', function () {
            var target = $(this).closest('.childrenList').find('.elementDropDown');
            target.removeClass('drop');
            target.find('.treeDropdown').removeClass('open');
            target.find('.spanDropdown').removeClass('open');
        });

    } catch (e) {
        //finLoading(".childrenElementList");

    } finally {
        // finLoading(".childrenTable"); // finish loading children show  
    }
}

function CallBackUpdateRow(responseData, TRrow) {
    try {
        if (responseData.d.status == 'success') {

            var rowObj = $(TRrow.node());
            var rowdata = $('#childrenList').DataTable().row(rowObj).data();
            if (typeof (rowdata) != "undefined") {
                rowdata["ItemDrag"] = "<i class=\"fa fa-ellipsis-v\"></i>"; // Adding Theme Column
                $.each(rowdata, function (key, val) {
                    if (key != "DT_RowId") {
                        if (typeof (responseData.d.elementProperties) != "undefined") {
                            rowObj.attr("data-name", responseData.d.elementProperties.Name);
                            rowObj.attr("data-guid", responseData.d.elementProperties.Guid);
                            rowObj.attr("data-type", responseData.d.elementProperties.Type);
                            rowObj.attr("data-basetype", responseData.d.elementProperties.BaseType);
                            rowObj.attr("data-technology", responseData.d.elementProperties.Technology);
                            rowObj.attr("data-stereotype", responseData.d.elementProperties.Stereotype);
                            rowObj.attr("data-locked", responseData.d.elementProperties.Locked);
                            rowObj.attr("data-url", responseData.d.elementProperties.accessibleUrl);

                            if (enablelink == '1')//Cursor pointer on Hover if Link Enabled
                            { rowObj.attr("style", "cursor:pointer;"); }

                            var collaborate = false;
                            if (responseData.d.elementProperties.IsReadAndCollaborate == true || responseData.d.elementProperties.IsWriteAndCollaborate == true) {
                                collaborate = true;
                            }
                            rowObj.attr("data-collaborate", collaborate);

                            rowObj.addClass("dataRows");
                            rowObj.addClass("dataListItem");

                            if (typeof (responseData.d.elementProperties[key]) != "undefined") {
                                if (key == "Name") {
                                    var pbiconClass = GetPBIconClass(responseData.d.elementProperties["Type"], responseData.d.elementProperties["BaseType"], responseData.d.elementProperties["Technology"], responseData.d.elementProperties["Stereotype"]);
                                    rowdata[key] = '<i class="pbicon ' + pbiconClass + '"></i>&nbsp;' + escapeHtml(responseData.d.elementProperties[key]);//Esacape Html content in Element childern table -DJ
                                    rowObj.attr("data-pbicon", pbiconClass);
                                }
                                else if (key == "Created") {
                                    rowdata[key] = responseData.d.elementProperties["CreatedDateString"];
                                }
                                else if (key == "Modified") {
                                    rowdata[key] = responseData.d.elementProperties["ModifiedDateString"];
                                }
                                else {
                                    //var utfstring = unescape(encodeURIComponent(responseData.d.elementProperties[key]));
                                    //var fixedstring=decodeURIComponent(escape(responseData.d.elementProperties[key]));
                                    rowdata[key] = responseData.d.elementProperties[key];
                                }
                            }
                            else if (typeof (responseData.d.elementProperties.EAObjectExtendedProperties) != "undefined" && responseData.d.elementProperties.EAObjectExtendedProperties.length > 0) {
                                $.each(responseData.d.elementProperties.EAObjectExtendedProperties, function (index, object) {
                                    if (typeof (object) != "undefined" && Object.keys(object).length > 0) {
                                        if (object.Name == key) {
                                            //rowdata[key] = object.Value;
                                            //Get type of Custom attribute : RZN V2.6
                                            if (object.PropertyNotes != "") {
                                                var typ = object.PropertyNotes.split(';')[0].split('=')[1];
                                                if (typ == "RefGUID") {//for RefGUID type show value as like in property tab
                                                    var artifactUrl = '/Repository/Artifact.aspx?repId=' + repositoryId;
                                                    var tmpGUID = object.Value;
                                                    $.getJSON("/Repository/GetObjectByGUID.aspx", { "repositoryId": repositoryId, "objectGuid": tmpGUID }, function (data) {
                                                        var tmpLink = '<a href="' + artifactUrl + '&procId=' + tmpGUID + '" target="_blank">' + data.Name + ' <i class="fa fa-external-link"></i></a>';
                                                        rowdata[key] = '<div class="refGuidRow"><span data-guid=\"' + object.Value + '\" class=\"RefGUIDObject\">' + tmpLink + '</span>';
                                                        TRrow.invalidate();
                                                    });
                                                }
                                                else {
                                                    rowdata[key] = object.Value;
                                                }
                                            }
                                            else {
                                                rowdata[key] = object.Value;
                                            }
                                        }
                                    }
                                });
                            }
                        }
                    }
                });
                //$('#childrenList').DataTable().row(rowObj).invalidate();
                TRrow.invalidate();


            }
            else { TRrow.invalidate(); }
        }
        else {
            var rowdata = $('#childrenList').DataTable().row(rowObj).data();
            rowdata["Name"] = "Error on loading artifact details".
                TRrow.invalidate();
        }
    } catch (e) {
        //alert(e);
    }
    setWindowHeight();
}

//commom ajax request method.
function handleAjaxRequest(timeOut, async, requestMethod, dataContent, callBackMethodName, option) {
    var responseData;
    urlValue = RequestFullUrl + requestMethod;
    if (typeof (timeOut) == 'undefined' || timeOut == null) {
        timeOut = 0;
    }
    try {
        $.ajax({
            async: async,
            timeout: timeOut,
            cache: false,
            type: "POST",
            url: urlValue,
            data: dataContent,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data) {
                responseData = data;
                if (typeof callBackMethodName != "undefined") {
                    if (typeof option != "undefined") { window[callBackMethodName](data, option); } else { window[callBackMethodName](data); }
                }
            },
            failure: function (failureData) {
                //alert("Application Error : " + failureData.d);
                responseData = failureData;
            },
            error: function (jqXHR, exception) {
                if (jqXHR.status === 0) {
                } else if (jqXHR.status == 401) {//unauthorized or session expired


                } else if (jqXHR.status == 403) {
                    //window.location.reload();
                } else if (jqXHR.status == 404) {
                    //window.location.reload();
                } else if (jqXHR.status == 500) {
                    //window.location.reload();
                } else if (exception === 'parsererror') {
                    //window.location.reload();
                } else if (exception === 'timeout') {
                    //window.location.reload();
                } else if (exception === 'abort') {
                    //window.location.reload();
                } else {
                }
            },
            beforeSend: function (jqXHR) {
                if (requestMethod == "API/Method.aspx/GetDiscussionsListForElementGuidsWithLimitAndOffset1") {
                    if (typeof ($.xhrDiscussionRequestPool) != "undefined" && $.xhrDiscussionRequestPool != null) {
                        $.xhrDiscussionRequestPool.abortAll();
                        $.xhrDiscussionRequestPool.push(jqXHR);
                    }
                }
                else {
                    if (typeof ($.xhrPool) != "undefined" && $.xhrPool != null) {
                        $.xhrPool.push(jqXHR);
                    }
                }

            }, //  annd connection to list
            complete: function (jqXHR) {
                try {
                    if (typeof $.xhrPool != 'undefined') {
                        var i = $.xhrPool.indexOf(jqXHR);   //  get index for current connection completed
                        if (i > -1) $.xhrPool.splice(i, 1); //  removes from list by index
                    }
                } catch (e) {
                }
            }
        });

        if (!async && typeof callbackmethodname == "undefined") {
            return responseData;
        }

    } catch (error) {
        //alert(error);
    }

}

function decodeUrlParam(urlText) {
    if (urlText != null) {
        return decodeURIComponent(urlText.replace(/\+/g, " "));
    } else {
        return "";
    }
}

var getQueryString = function (field, url) {
    var href = url ? url : window.location.href;
    var reg = new RegExp('[?&]' + field + '=([^&#]*)', 'i');
    var string = reg.exec(href);
    return string ? string[1] : null;
};

// Set New Url
function setNewUrlParam() {
    //if (typeof getQueryString("procId") != "undefined" && getQueryString("procId") != null && getQueryString("procId") != "") {
    //    queries.procId = getQueryString("procId");
    //}
    ////console.log(queries)
    ////var NewUrl = window.location.pathname + '?' + decodeURIComponent(jQuery.param(queries));
    //var NewUrl = window.location.pathname + '?' + decodeUrlParam(jQuery.param(queries));
    ////console.log(NewUrl);
    ////$("#SearchTextDisplay").html($('.dataTables_filter input').val());
    //window.history.pushState({}, document.title, NewUrl);
}

// Get Prolaborate Icon Class
function GetPBIconClass(Type, BaseType, Technology, Stereotype, Mode) {
    try {
        var pbiconClass = "";

        switch (Type) {
            case "Model": pbiconClass = "pbicon-Model" + (Mode == "Full" ? "_Full" : ""); break;
            case "Package": pbiconClass = "pbicon-Package" + (Mode == "Full" ? "_Full" : ""); break;
            case "Element::Scenario": pbiconClass = "pbicon-scenario"; break;
            case "Element::Attribute": pbiconClass = "pbicon-attributes"; break;
            case "Element::Operation": pbiconClass = "pbicon-operations"; break;
            case "review": pbiconClass = "pbicon-Package" + (Mode == "Full" ? "_Full" : ""); break;
            case "Element":
            case "Diagram":
            case "Diagram::Element":
            case "Diagram::Connector":
            default:

                var tmpIMGClass = "";
                var tmpUMLClass = "";
                var tmpTechClass = "";

                tmpIMGClass = (Type == "Diagram" ? "pbicon-Diagram" : "");

                tmpUMLClass = "pbicon-UML_" + BaseType + (Type == "Diagram" ? "_Diagram" : "");
                tmpUMLClass = tmpUMLClass.replace(".", "_").replace(" ", "");

                if (Stereotype != "" && (Stereotype == "documentVersion" || Stereotype == "eaDocXDocument")) {
                    Technology = "Extended";
                }

                tmpTechClass = (Stereotype == null || Stereotype == "" || Technology == null || Technology == "") ? '' : ("pbicon-" + Technology + "_" + Stereotype + (Type == "Diagram" ? "_Diagram" : ""));
                tmpTechClass = tmpTechClass.replace(".", "_").replace(" ", "");

                pbiconClass = tmpIMGClass + " " +
                    tmpUMLClass + (tmpUMLClass != '' && Mode == "Full" && Type != "Diagram" ? "_Full" : "") + " " +
                    tmpTechClass + (tmpTechClass != '' && Mode == "Full" && Type != "Diagram" ? "_Full" : "");

                break;

        }

        return pbiconClass;
    } catch (e) {
        console.log(e);
    }
}

//Event for Recursive Switch
$(document).on('change', '.includeRecursiveCheck', function () {
    var Checkedvalue = $(this).prop('checked');
    try {
        //var elementId = $("#elementId").val();
        queries.subpackage = 0;
        if (Checkedvalue) { CallSelectedChild = true; queries.subpackage = 1; } else {
            CallSelectedChild = false;
            //$('.groupArtifacts option:first').prop("selected", true);
            //$('.groupArtifacts option:first').attr('selected', 'selected');
            $('.groupArtifacts option[value="All - All"]').prop("selected", true);
            $('.groupArtifacts option[value="All - All"]').attr('selected', 'selected');
            queries.childelement = $(".groupArtifacts option:selected").val();
        }
        if (queries.subpackage == 0) {
            delete queries.subpackage;
            delete queries.childelement;
        }
        LoadChildrenArtifacts(repositoryId, elementId, elementType, Checkedvalue);
    } catch (e) {
        console.log(e);
    }
});

//Show/Hide Column
var dataColValue = [];

$(document).on('click', '.dropdown-toggle', function () {
    //$(this).parent().addClass('open');
});

$(document).on('loaded.bs.select', '#dataColShowHide', function () {
    dataColValue = $(this).val();
    try {
        if (dataColValue != null) {
            $.each(dataColValue, function (index, ColValue) {
                if (getQueryString(ColValue) != null && getQueryString(ColValue) == 0) {

                    var CurColumn = $('#childrenList').DataTable().column('[data-colid="' + ColValue + '"]');

                    CurColumn.visible(false);


                    $("li[data-original-index=" + index + "]").removeClass("selected");
                    $("li[data-original-index=" + index + "]").trigger("change");

                    $('#dataColShowHide option[data-tokens="' + ColValue + '"]').trigger("click");


                }
            });
        }
    } catch (e) {
        console.log(e);
    }
    //console.log(dataColValue);
});

$(document).on('changed.bs.select', '#dataColShowHide', function (e, clickedIndex, newValue, oldValue) {
    try {
        var clickedVal = dataColValue[clickedIndex];
        var column = $('#childrenList').DataTable().column('[data-colid="' + clickedVal + '"]');
        //alert(dataColValue);
        //console.log(clickedIndex  + "<< oldValue >>> " + oldValue + "<<newValue>>> " + newValue + " <<<dataColValue[clickedIndex]>>> " + dataColValue[clickedIndex]);
        // Toggle the visibility
        newValue ? column.visible(true) : column.visible(false);

        queries[clickedVal] = 0;
        if (typeof clickedVal != "undefined" && newValue) {
            queries[clickedVal] = 1;
            delete queries[clickedVal];
        }
        if (typeof clickedVal != "undefined") {
            setNewUrlParam();
        }

    } catch (e) {
        console.log(e);
    }
});
//Filter by Type select
$(document).on('change', '.groupArtifacts', function () {
    //var value = $(this).val();
    try {
        var value = $(".groupArtifacts option:selected").val();
        var ColumnKeys = groupPropertiesObject[value]["columns"];
        //var ListItems = groupedArtifacts.Groups[value];
        queries.childelement = value;
        setNewUrlParam();
        //updateArtifactList(ColumnKeys);
        //var elementId = $("#elementId").val();
        var includeRecursive = $(".includeRecursiveCheck").prop('checked');
        //var ReqData = "{repositoryId:'" + repositoryId + "', ELementGuid:'" + elementId + "', includeRecursive:" + includeRecursive + ", GroupKey:'" + value + "'}";
        //handleAjaxRequest(null, true, "API/Request.aspx/GetTabaleColumnsByGroupKeyAPI", ReqData, "CallBackGetTabaleColumnsByGroupKey");
        var url1 = "/rest/prolaborate-admin/1.0/ProlabGetTabaleColumnsByGroupKey";
        var data = '{"repositoryId":"' + repositoryId + '", "Guid":"' + elementId + '", "ElementType":"' + elementType + '", "IncludeRecursive":' + includeRecursive + ', "GroupKey":"' + value + '"}';
        handleAjaxRequest(null, true, url1, data, "CallBackGetTabaleColumnsByGroupKey");
    } catch (e) {
        console.log(e);
    }
});

// Element DropDown : On Children List
$(document).on('click', 'tr.dataRows .Name', function (e) {//(tr.dataRows --> tr.dataRows .Name) RZN V2.6
    try {
        if (enablelink == 0) { return false; }

        // Get Target Attributes
        var target = $(this).closest('.dataRows');
        var parent = target.closest('.childrenList');
        var dropContainer = parent.find('.dropAction');
        var footerWrap = parent.find('.dropOverflow');

        var targetData = {
            "Guid": target.attr('data-guid'),
            "Name": htmlDecode(target.attr('data-name')),
            "Type": target.attr('data-type'),
            "BaseType": (typeof target.attr('data-basetype') != "undefined" ? target.attr('data-basetype') : ""),
            "Technology": (typeof target.attr('data-technology') != "undefined" ? target.attr('data-technology') : ""),
            "Stereotype": (typeof target.attr('data-stereotype') != "undefined" ? target.attr('data-stereotype') : ""),
            "IsLocked": target.attr('data-locked'),
            "IsComposite": 'True',
            "CompositeDiagram": target.attr('data-guid'),
            "ShareURL": target.attr('data-url'),
            "Icon": target.attr('data-pbicon'),
            "IsCollaborate": target.attr('data-collaborate'),
            "QuickInfo": false,
            "Module": 'Children'
        }

        window.open(requestURL + (targetData.ShareURL).split("*")[0], '_blank');
        return false;
    } catch (e) {
        console.log(e);
    }
});


function htmlDecode(value) {
    return $('<div/>').html(value).text();
}

//To View EADocx
$(document).on("click", ".ViewEADocxDocument", function () {
    try {
        var url1 = "/rest/prolaborate-admin/1.0/ProlabEADocXPath";
        var data = '{"repositoryId":"' + repositoryId + '", "documentId":"' + $(this).attr("data-guid") + '"}';
        handleAjaxRequest(null, true, url1, data, "CallBackGetEADocxDocumentPath");
    } catch (e) {
        console.log(e);
    }
});

function CallBackGetEADocxDocumentPath(responseData) {
    try {
        if (responseData.d.status == 'success') {
            var name = "Latest Version";
            if (responseData.d.name != "undefined") {
                name = responseData.d.name;
            }
            if (responseData.d.path != "undefined") {

                var src = "https://view.officeapps.live.com/op/embed.aspx?src=" + responseData.d.path;
                //alert(src);
                var win = window.open(src, '_blank');
                win.focus();
            }
        }
    }
    catch (e) {
    }
}

//Adjust I-Frame height -Dj -v1.8
function setWindowHeight() {
    var Height = $(".pdArtifactWrap").height();
    var windowHeight = parseInt(Height) + 20;
    $('iframe#' + IframeRandomId + '', parent.document).attr("style", "height:" + windowHeight + "px;border:0");
}

//To Download EADocx
$(document).on("click", ".DownloadEADocxDocument", function () {
    EADocxViewer($(this).attr("data-guid"));
});

function EADocxViewer(docId) {
    var postData = null;
    window.location.href = requestURL + "/Repository/DocumentViewer.aspx/?repId=" + repositoryId + "&documentId=" + docId + "&userId=" + userId;

}

$(document).on('click', '.ElementNavigation', function () {
    var url = $(this).attr("data-url");
    NavigatioinURL = requestURL + "/" + url;
    window.open(NavigatioinURL, '_blank');
});