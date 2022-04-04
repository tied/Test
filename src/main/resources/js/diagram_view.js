
var elementTable = '';
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
        if (typeof (elementType) != "undefined" && elementType == "Diagram") {
            IframeRandomId = Prol_IframeId;
            setWindowHeight();
            //fitToScreen(); // Diagram Fit to screen.
            var targetIMG = $('#DMapWrap img[usemap]');
            // Diagram : Map Area : hilight
            targetIMG.maphilight({ strokeColor: '08a2ee', strokeWidth: 2, strokeOpacity: 1 });
            // Diagram : Map Area : Zoom
            targetIMG.zoomable({ mouseWheel: false });
            // Diagram : Map Area : Fit to Screen
            fitToScreen();

            // Single Click Dbl Click Check
            var DELAY = 500,
                clicks = 0,
                timer = null;
            $(document).on('click', '.OpenAreaWidget', function (e) {
                OpenAreaWidgetSglClick(e, $(this));
                //Remove double click event temporary
                //clicks++;
                //if (clicks === 1) {
                //    timer = setTimeout(function () {
                //        clicks = 0;
                //        OpenAreaWidgetSglClick(e, $(this));
                //    }, DELAY);
                //} else {
                //    clearTimeout(timer);
                //    clicks = 0;
                //    OpenAreaWidgetDblClick(e, $(this));
                //}
                e.preventDefault();
            });

            $(document).on('dblclick', '.OpenAreaWidget', function (e) {
                e.preventDefault();
            });

            // tooltip
            //addToolTip();
            //AJS.$(".ToolTip").tooltip({ gravity: 'w' });
            var elementTraceabilityDetails = $('#elementTraceabilityDetails');
            if (typeof (elementTraceabilityDetails) != "undefined" && elementTraceabilityDetails.length != 0) {
                LoadChildrenArtifacts(repositoryId, elementId, elementType, false);
            } else {
                setTimeout(function () {
                    setWindowHeight();
                    fitToScreen(); // Diagram Fit to screen.
                    var targetIMG = $('#DMapWrap img[usemap]');
                    // Diagram : Map Area : hilight
                    targetIMG.maphilight({ strokeColor: '08a2ee', strokeWidth: 2, strokeOpacity: 1 });
                    // Diagram : Map Area : Zoom
                    targetIMG.zoomable({ mouseWheel: false });
                    // Diagram : Map Area : Fit to Screen
                    fitToScreen(); }, 3000);
            }
            $(".ProlaborateImageClass").attr("style", "background: url(" + requestURL + "/Assets/Images/ExternalApp/Logo/prolaborate.png) no-repeat left transparent;background-size:72px 72px");
        }
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
$(document).on('click', viewData.viewTable.trigger, function () { switchElementView('table'); });
$(document).on('click', viewData.viewList.trigger, function () { switchElementView('list'); });

// Process Diagram : Comment Bubble : Toggle
$(document).on('click', '#toggleCommentBubble', function () { toggleCommentBubble($(this)) });
// Process Diagram : Integration Bubble : Toggle
$(document).on('click', '#toggleIntegrationBubble', function () { toggleIntegrateBubble($(this)) });
// Process Diagram : Zoom In : Trigger
$(document).on('click', '#zoomInImg', zoomInDiagram);
// Process Diagram : Zoom Out : Trigger
$(document).on('click', '#zoomOutImg', zoomOutDiagram);
// Process Diagram : Fit to screen [Best Fit] : Trigger
$(document).on('click', '#fitToScreen', fitToScreen);
// Process Diagram : Refresh Diagram
$(document).on('click', '#refreshDiagram', function () {
    /*
    // Reset Scroll Position
    $('.mapAreaContent').scrollLeft('0');
    $('.mapAreaContent').scrollTop('0');

    // Refresh diagram
    refreshDiagram();
    */
    //alert('#refreshDiagram');
    refreshDiagram();
});
// Process Diagram : As ImpactAnalysis
$(document).on('click', '#linkToDiagramAsImpactAnalysis', function () {
    try {
        /*
        var strData = JSON.stringify({ "RepositoryId": repositoryId, "ElementGuid": $("#elementId").val() });
        handleAjaxRequest(null, true, "API/Request.aspx/CheckAccessForImpactAnalysis", strData, "CallBackCheckAccessForImpactAnalysis");
        */
    } catch (e) {
        console.log(e);
    }
});
// Process Diagram : Share
$(document).on('click', '#linkToDiagram', function () {
    try {
        /*
        var shareURL = window.location.origin + "/Diagrams/View.aspx?repId=" + repositoryId + "&procId=" + $("#elementId").val();
        //var shareURL        = $('.DMapWrap img').attr('data-src');
        var artifactData    = {
            "Name"          : $("#elementName").val(),
            "Guid"          : $("#elementId").val(),
            "Type"          : $("#elementType").val(),
            "BaseType"      : $("#elementBaseType").val(),
            "Technology"    : $("#elementTechnology").val(),
            "Stereotype"    : $("#elementStereotype").val(),
            "Icon"          : ""
        }
        
        shareModalShow(shareURL, 'FullURL', 'Share Diagram Link', artifactData);
        */
    } catch (e) {
        console.log(e);
    }
});


// -----------------------------------
// fn
// -----------------------------------

function initCall(DefaultTab) {

    if (getQueryString("fullScreen") == 1) {
        initLoader("body");
    }
    queries = {};
    $.each(document.location.search.substr(1).split('&'), function (c, q) {
        var i = q.split('=');
        queries[i[0].toString()] = i[1].toString();
    });

    //Get collaborators users list.
    //Declare default variables from hidden values 
    var shareurlvalue = $(".shareurlvalue").val();
    var elementId = $("#elementId").val();
    var elementName = $("#elementName").val();
    var elementType = $("#elementType").val();
    var elementBaseType = $("#elementBaseType").val();
    var elementTechnology = $("#elementTechnology").val();
    var elementStereotype = $("#elementStereotype").val();

    var discussionJsonString = $("#artifactDiscussions").val();
    var diagramObjectsListString = $("#diagramObjectsList").val();

    var EnableDiagramDiscussion = $("#EnableDiagramDiscussion").val();
    var EnableDiagramConnectors = $("#EnableDiagramConnectors").val();
    var EnableDiagramIntegratedApps = $("#EnableDiagramIntegratedApps").val();

    var firstArtifactDiscussions = {};
    var diagramObjects = {};
    UseraccessType = $("#AccessType").val();

    if (typeof (UseraccessType) != "undefined" && UseraccessType.trim().toLowerCase() == "true") {
        UseraccessType = true;
    }
    else if (typeof (UseraccessType) != "undefined" && UseraccessType.trim().toLowerCase() == "false") {
        UseraccessType = false;
    }
    else {
        UseraccessType = true;
    }

    //Check if the artifact is of type review.
    if (elementType.trim() == "review") {

        $(".overviewContentContainer").show();

        initReviewCall();

    } else {

        $(".shareUrlActivityBtn").attr({
            "data-url": shareurlvalue,
            "data-guid": elementId,
            "data-name": elementName,
            "data-type": elementType,
            "data-basetype": elementBaseType,
            "data-technology": elementTechnology,
            "data-stereotype": elementStereotype
        });

        $("#shareProcessURLBtn").attr("data-url", shareurlvalue);


        discussionGuidsArray.push(elementId);
        //Invite collaboartors available.
        if ($("#inviteCollaboratorsBtn").length > 0) {

            //Set title for collaboration invite modal dialog.
            $(".inviteTitle").text(unescape(elementName));
            $(".inviteTitleTop").attr("data-original-title", unescape(elementName));
        }

        $(".overviewContentContainer").show();

        try {
            if ($(".pdActivities").length > 0) {
                initLoader(".pdActivities");
            }

            //Ajax Request for child artifacts. 
            if ($(".childrenElementList").length > 0 && $(".elementTraceabilityDetails").hasClass("hidden") == false) {

                RenderChildren();
                // ENDDD

            }

            if ($(".diagramTab").length > 0) {
                //Initialize loader for artifact tab.
                EnableDiagramDiscussionFilter = false;
                if (typeof (EnableDiagramDiscussion) != "undefined" && EnableDiagramDiscussion != null && EnableDiagramDiscussion.trim().toLowerCase() == "true") {
                    EnableDiagramDiscussionFilter = true;
                }
                EnableDiagramConnectorsFilter = false;
                if (typeof (EnableDiagramConnectors) != "undefined" && EnableDiagramConnectors != null && EnableDiagramConnectors.trim().toLowerCase() == "true") {
                    EnableDiagramConnectorsFilter = true;
                }
                EnableDiagramIntegratedAppsFilter = false;
                if (typeof (EnableDiagramIntegratedApps) != "undefined" && EnableDiagramIntegratedApps != null && EnableDiagramIntegratedApps.trim().toLowerCase() == "true") {
                    EnableDiagramIntegratedAppsFilter = true;
                }
                LoadDiagramForArtifact(EnableDiagramDiscussionFilter, EnableDiagramConnectorsFilter, EnableDiagramIntegratedAppsFilter);
                //GetDiagramObjects(elementId);
                diagraObjectsArray.push(elementId);
            }

            GetReviewInfo();

            if (typeof (DefaultTab) != "undefined" && DefaultTab != null) {
                //check if DefaultTab value is discussions
                if (DefaultTab == "discussions") {
                    //check if diagram tab present.
                    if ($(".diagramTab").length > 0) {
                    }
                    else {
                        if ($(".overviewTab").length > 0) {
                            $(".pdOverview").addClass('active');
                            $(".overviewTab").addClass('active');

                            var CallBackMethodForGetElementInfo = "callBackGetElementInfo";
                            initLoader(".childrenElementThumb");
                            GetELementInfo(elementId, elementType, repositoryId, CallBackMethodForGetElementInfo);
                        }

                    }
                    //Handle discussion, by opening side bar 
                    //Open Discussion side bar widget for the artifact page.
                    getAssociatedElements();
                    $(".showOverviewDiscussions").trigger("click");
                    //apply if any filters available.
                }
                else {
                    $("*[data-tabname='" + DefaultTab + "']").find("a").trigger('click');
                }

            }
            else {
                //check if diagram tab present.
                if ($(".diagramTab").length > 0) {
                    //Initialize loader for artifact tab.
                    //LoadDiagramForArtifact();
                    //GetDiagramObjects(elementId);
                    //diagraObjectsArray.push(elementId);
                }
                else {
                    if ($(".overviewTab").length > 0) {
                        //set overview tab as default tab.
                        $(".pdOverview").addClass('active');
                        $(".overviewTab").addClass('active');

                        var CallBackMethodForGetElementInfo = "callBackGetElementInfo";
                        initLoader(".childrenElementThumb");
                        GetELementInfo(elementId, elementType, repositoryId, CallBackMethodForGetElementInfo);

                    }

                }
            }

            //Get breadcrumb of the artifact.
            var FQPathContainer = $('.currentElementFQPath');
            if (typeof (FQPathContainer) != "undefined" && FQPathContainer.length > 0) {
                GetFQPathInfo(elementId, repositoryId, FQPathContainer);
            }

            try {
                ActiveSwitchery(); // swith for children show
                finLoading(".childrenList"); // finish loading children show  
            }
            catch (e) {
            }

            addFormErrorToolTip();

            //Reset artifact list table.
            $(".childrenTable .childrenListTable").html('');
            $(".groupArtifacts").html('');
            childrenListTable = "";
            iColumns = "";
            groupPropertiesObject = {};

            groupedArtifacts = "";
            discussionGuidsArray = new Array();
            diagraObjectsArray = new Array();


        } catch (e) {
        }

        // Process Title Tool Tip
        var processTitle = $('.processTitle').text();
        $('.processTitle').attr('data-original-title', processTitle);

        //If param contains share. trigger share url
        var auth = getQueryString("Auth");
        var shareOpt = getQueryString("Share");
        var inviteOpt = getQueryString("Invite");
        if (typeof (auth) == "undefined" || auth == null) {
            if (typeof (shareOpt) != "undefined" && shareOpt != null && shareOpt == "1") {
                if ($("#shareProcessURLBtn").length > 0) {
                    $("#shareProcessURLBtn").trigger("click");
                }
            }

            if (typeof (inviteOpt) != "undefined" && inviteOpt != null && inviteOpt == "1") {
                if ($("#inviteCollaboratorsBtn").length > 0) {
                    $("#inviteCollaboratorsBtn").trigger("click");
                }
            }
        }

    }

}


// Element DropDown : On Artifact Diagram
function OpenAreaWidgetSglClick(e, obj) {
    // Map Area : Turn off all hilight
    $("area").data('maphilight', { alwaysOn: false }).trigger('alwaysOn.maphilight');

    // Map Area : Turn on one hilight for Clicked Area
    obj.data('maphilight', { alwaysOn: true }).trigger('alwaysOn.maphilight');

    // Connection Bubble
    var connectionBubble = $('.DMapConnectionBubble');
    connectionBubble.removeClass('open'); // Close Dropdown
    connectionBubble.find('a[data-toggle="dropdown"]').attr('aria-expanded', 'false'); // Reset aria

    // Get Target Attributes
    var target = $(e.target);
    var parent = target.closest('.mapAreaContent')
    var footerWrap = parent.find('.dropOverflow');
    var targetData = {
        "Guid": target.attr('data-guid'),
        "Name": target.attr('title'),
        "Type": target.attr('data-type'),
        "BaseType": target.attr('data-basetype'),
        "Technology": target.attr('data-technology'),
        "Stereotype": target.attr('data-stereotype'),
        "IsLocked": target.attr('data-locked'),
        "IsComposite": target.attr('data-iscomposite'),
        "CompositeDiagram": target.attr('data-compositediagram'),
        "ShareURL": target.attr('data-url'),
        "Icon": target.attr('data-pbicon'),
        "QuickInfo": false
    }

    // Hide more/less option if only 3 comes.
    footerWrap.find('.dropOverflowFix').hide();
    footerWrap.find('.dropMinMax').show();
    // Show more/less : less fn : close
    //toggleDropMinMax($('.dropMinMax'), 'close');

    // Map Area DropDown : Show
    showElementDropdownHover(e, target, parent, targetData);

    var targetDropdown = parent.find('.elementDropDown');
    var targetDropdownMenu = targetDropdown.find('.dropdown-menu');

    var dockableWindow = $('#dockableWindow');

    // Map Area DropDown : Position
    // (targetDropDown ID/Class , relativeParent ID/Class, scrollParent ID/Class)
    elementDropdownPositionHover(targetDropdown, parent, parent, 'outside');

    // Map Area DropDown : Scroll Top to Focus Dropdown.
    var dropdownTop = targetDropdown.position().top + parent.scrollTop();
    if (targetDropdown.hasClass('dropup')) { dropdownTop = dropdownTop - (targetDropdownMenu.height() + 14 + 2 + 10) }
    parent.animate({ scrollTop: dropdownTop - 50 }, 400);

    return false;
}

function OpenAreaWidgetDblClick(e, obj) {
    var target = obj
    var targetData = {
        Guid: target.attr('data-guid'),
        IsComposite: target.attr('data-iscomposite'),
        CompositeDiagram: target.attr('data-compositediagram'),
        Type: target.attr('data-elementType')
    }
    CheckCompositeDiagram(targetData.Guid, targetData.Type);
}

function CheckCompositeDiagram(Guid, Type) {
    var data = "{RepositoryId:'" + '' + "', UserId:'" + '' + "', ElementId:'" + addslashes(Guid) + "',ElementType:'" + Type + "'}";
    handleAjaxRequest(null, true, "API/Request.aspx/CheckCompositeDiagram", data, "CallBackCheckCompositeDiagram", Guid);
}

function CallBackCheckCompositeDiagram(responseData, elementGuid) {
    try {
        var targetGUID = elementGuid;
        var dockableWindow = $('#dockableWindow');
        dockableWindow.propertyWindow({ method: 'hide' });
        var loadArtifactPage = true;
        if (responseData.d.status == 'success' && responseData.d.resultElement != 'undefined') {
            if (responseData.d.resultElement.IsComposite == true) {
                targetGUID = responseData.d.resultElement.CompositeDiagram;
            } else {
                if ((responseData.d.resultElement != 'undefined') && ((responseData.d.resultElement.BaseType == 'Boundary') || (responseData.d.resultElement.BaseType == 'Constraint') || (responseData.d.resultElement.BaseType == 'Note') || (responseData.d.resultElement.BaseType == 'Text'))) {
                    //show content msg
                    if (responseData.d.resultElement.IsLink == true && responseData.d.resultElement.LinkType == "Hyperlink") {
                        window.open(responseData.d.resultElement.LinkDetail, '_blank');
                        return false;
                    } else {
                        var LoadingMessage = 'No landing page for these type of elements';
                        $(".mapAreaLoaderContent").html(LoadingMessage);
                        $('.mapAreaLoaderContent').show();
                        setTimeout(function () { $('.mapAreaLoaderContent').hide(); }, 5000);
                        loadArtifactPage = false;
                    }
                }
                targetGUID = responseData.d.resultElement.Guid;
            }
        }
        if (loadArtifactPage == true) {
            loadArtifact(targetGUID, null, null);
            $('.packageTree').jstree("destroy");
            packageTree();
            //$('.packageTree').jstree("refresh"); //to reload the repository browser, so the selected element will be visible.
        }
    } catch (e) {
    }
}


// Process Diagram : Get Data

function GetDiagramSettingsInfo(diagramGuid) {
    var EnableDiagramDiscussion = $("#EnableDiagramDiscussion").val();
    var EnableDiagramConnectors = $("#EnableDiagramConnectors").val();
    var EnableDiagramIntegratedApps = $("#EnableDiagramIntegratedApps").val();
    var EnableDiagramDiscussionFilter = false;
    if (typeof (EnableDiagramDiscussion) != "undefined" && EnableDiagramDiscussion != null && EnableDiagramDiscussion.trim().toLowerCase() == "true") {
        EnableDiagramDiscussionFilter = true;
    }
    var EnableDiagramConnectorsFilter = false;
    if (typeof (EnableDiagramConnectors) != "undefined" && EnableDiagramConnectors != null && EnableDiagramConnectors.trim().toLowerCase() == "true") {
        EnableDiagramConnectorsFilter = true;
    }
    var EnableDiagramIntegratedAppsFilter = false;
    if (typeof (EnableDiagramIntegratedApps) != "undefined" && EnableDiagramIntegratedApps != null && EnableDiagramIntegratedApps.trim().toLowerCase() == "true") {
        EnableDiagramIntegratedAppsFilter = true;
    }
    var DiagramInfo = {
        DiagramGuid: diagramGuid,
        loadDiscussions: EnableDiagramDiscussionFilter,
        GetExternalAppCount: EnableDiagramIntegratedAppsFilter,
        GetConnectorInfo: EnableDiagramConnectorsFilter
    }
    return DiagramInfo;
}

function refreshDiagram() {
    $(".SelectedProcessName").html($("#elementName").val());
    $(".SelectedProcessName").attr("data-selectedelementguid", $("#elementId").val());
    $(".SelectedProcessName").attr("data-selectedelementtype", $("#elementType").val());


    //$(".mapAreaContent").css('overflow', 'hidden');

    // Hide Property Window
    //$('#dockableWindow').propertyWindow({ method: 'hide' });

    // Hide Map Action Controls
    $('.mapAreaAction a').hide();

    // Load Data
    var data = "{ElementId:'" + addslashes($("#elementId").val()) + "',ForceGenerate:true, IncludeHTMLMap:" + false + ",IncludeDiscussionBallons:" + false + ",RepositoryId:'" + repositoryId + "', UserId:'" + userId + "'}";

    var DiagramInfo = GetDiagramSettingsInfo($("#elementId").val());
    handleAjaxRequest(null, true, "API/Method.aspx/GetDiagramAndDiagramObjects", data, "CallBackGetDiagramAndDiagramObjects", DiagramInfo);

    // Showing Sidebar Menu
    $('.sidebar-menu').addClass('open');

    //Rest if discussions available.
    //if ($(".discussionTab").length > 0) {
    //    $('.artifactDiscussionFilter[data-guid="' + $("#elementId").val() + '"]').trigger('click');
    //}
}

function BuildDiagramAppliedSettings() {
    var enableDiscussion = '';
    var enableConnectors = '';
    var enableExternalAppCount = '';
    var DiagramSideBarObj = { 'EnableDiscussion': enableDiscussion, 'EnableConnectors': enableConnectors, 'EnableExternalAppCount': enableExternalAppCount };
    return DiagramSideBarObj;
}

// Process Diagram : Zoom In fn
function zoomInDiagram() {
    $('#DMapWrap img[usemap]').zoomable({ method: 'zoomIn' });
}

// Process Diagram : Zoom Out fn
function zoomOutDiagram() {
    $('#DMapWrap img[usemap]').zoomable({ method: 'zoomOut' });
}

// Process Diagram : Fit to screen [Best Fit] fn
function fitToScreen() {
    var targetImg = $('#DMapWrap img');
    var targetParent = targetImg.parent();

    var maxWidth = $('.mapAreaContent').width();
    var maxHeight = $('.mapAreaContent').height();
    targetImg.css({ 'height': '', 'width': '', 'max-height': maxHeight, 'max-width': maxWidth });
    targetParent.css({ 'height': '', 'width': '', 'max-height': maxHeight, 'max-width': maxWidth, 'background-size': 'contain' });

    var imgWidth = $('#DMapWrap img').width();
    var imgHeight = $('#DMapWrap img').height();
    targetImg.css({ 'height': imgHeight, 'width': imgWidth });
    targetParent.css({ 'height': imgHeight, 'width': imgWidth });

    $('#DMapWrap img').zoomable({ method: 'fitScreen' })
}

// Process Diagram : Comment Bubble fn
// params : mapID [map tag id attribute value] , processID []
function commentBubble(mapID, elementDiscussionCounts, processID) {
    try {
        var bubbleContainer = $('#DMapCommentBubbleContainer');
        var DiscussionCount = {};

        if (typeof (elementDiscussionCounts) != "undefined" && elementDiscussionCounts != null && Object.keys(elementDiscussionCounts).length > 0) {
            DiscussionCount = elementDiscussionCounts;
        } else {
            var existingDiscussionCounts = {};
            var commentBallons = bubbleContainer.find(".DMapCommentBubble");

            if (typeof (commentBallons) != "undefined" && commentBallons.length > 0) {
                commentBallons.each(function () {
                    existingDiscussionCounts[$(this).attr("data-guid")] = $(this).find(".counter").html();
                });
            }
            DiscussionCount = existingDiscussionCounts;
        }

        var bubbleData = { "Discussion": DiscussionCount };
        generateBubbleString(mapID, bubbleContainer, bubbleData);

        commentBubbleContainerPostition(mapID.parent().find('img'), processID);
    } catch (e) {
        //console.log(e);
    }
}

// Process Diagram : Bubble : Generate Frame
function generateBubbleString(mapID, bubbleContainer, data) {
    var mapAreaList = mapID.find('area');
    var mapArea = [], commentArea = [];
    var bubblePlaceholder = '', bubbleString = '';

    $(mapAreaList).each(function () {
        var target = $(this);
        var areaVal = {
            "Guid": target.attr('data-guid'),
            "Name": target.attr('title'),
            "Type": target.attr('data-type'),
            "BaseType": target.attr('data-basetype'),
            "Technology": target.attr('data-technology'),
            "Stereotype": target.attr('data-stereotype'),
            "IsLocked": target.attr('data-locked'),
            "IsComposite": target.attr('data-iscomposite'),
            "CompositeDiagram": target.attr('data-compositediagram'),
            "DiagramCount": target.attr('data-diagramcount'),
            "DiagramGuid": target.attr('data-diagramguid'),
            "URL": target.attr('data-ur l'),
            "Coords": target.attr('coords'),
            "Intergration": {
                "Prolaborate": target.attr('data-integration-prolaborate'),
                "Jira": target.attr('data-integration-jira'),
                "Jama": target.attr('data-integration-jama'),
            }
        }
        areaVal.Icon = GetPBIconClass(areaVal.Type, areaVal.BaseType, areaVal.Technology, areaVal.Stereotype, "");

        var mapareaResult = $.grep(mapArea, function (e) { return ((e.Guid == areaVal.Guid) && (e.Intergration.Jira == areaVal.Intergration.Jira)); });
        if (mapareaResult.length == 0) {
            mapArea.push(areaVal);
        }
        // Generate Placeholder
        var areaCoords = areaVal.Coords.split(",");

        bubblePlaceholder += '<div class="DMapBubble" ';
        bubblePlaceholder += 'data-guid="' + areaVal.Guid + '" ';
        bubblePlaceholder += 'style="left:' + areaCoords[0] + 'px; top:' + areaCoords[3] + 'px;"';
        bubblePlaceholder += '>';
        bubblePlaceholder += '</div>';

        // Get Comment Bubble Data
        if (typeof (data.Discussion[areaVal.Guid]) != "undefined") {
            //Added By Ravi
            var result = $.grep(commentArea, function (e) { return e.Guid == areaVal.Guid; });
            if (result.length == 0) {
                commentArea.push(areaVal);
            }
            //commentArea.push(areaVal);
        }

    });

    bubbleContainer.html("");
    bubbleContainer.append(bubblePlaceholder);

    var appendBubble = function (str, guid) {
        $('.DMapBubble[data-guid="' + guid + '"]').append(str);
    }

    var DiagramInfo = GetDiagramSettingsInfo($('#elementId').val());

    // build Comment Bubble
    if (DiagramInfo.loadDiscussions == true) {
        for (i = 0; i < commentArea.length; i++) {
            bubbleString = buildBubble(commentArea[i], data.Discussion, 'Comment');
            appendBubble(bubbleString, commentArea[i].Guid);
        }
    }
    // build Jira Bubble
    if (DiagramInfo.GetExternalAppCount == true) {
        for (i = 0; i < mapArea.length; i++) {
            bubbleString = buildBubble(mapArea[i], '', 'Jira');
            appendBubble(bubbleString, mapArea[i].Guid);
        }
    }
}

// Process Diagram : Bubble : Build Bubble
function buildBubble(objArea, objSrc, objType) {
    var bubbleString = "", bubbleData = { Type: "", Count: "", Logo: "" };
    switch (objType) {
        case 'Comment': bubbleData = { Type: "Comment", Count: objSrc[objArea.Guid], Logo: "<i class=\"fa fa-comment\"></i>" }; break;
        case 'Jira': bubbleData = { Type: "Integration", Count: objArea.Intergration.Jira, Logo: "<img src=\"../Assets/Images/ExternalApp/Logo/jira_white.png\" alt=\"\" />" }; break;
        default: break;
    }
    var switchClass = (bubbleData.Type == 'Integration' ? 'DMapIntegrationBubble ' : '');
    if (bubbleData.Count > 0 && bubbleData.Count != null && bubbleData.Count != '' && typeof bubbleData.Count != 'undefined') {
        bubbleString += '<div class="' + switchClass + ' DMap' + objType + 'Bubble" ';
        bubbleString += 'data-bubbletype="' + bubbleData.Type + '" ';
        bubbleString += 'data-guid="' + objArea.Guid + '" ';
        bubbleString += 'data-name="' + objArea.Name + '" ';
        bubbleString += 'data-type="' + objArea.Type + '" ';
        bubbleString += 'data-basetype="' + objArea.BaseType + '" ';
        bubbleString += 'data-technology="' + objArea.Technology + '" ';
        bubbleString += 'data-stereotype="' + objArea.Stereotype + '" ';
        bubbleString += 'data-locked="' + objArea.IsLocked + '" ';
        bubbleString += 'data-url="' + objArea.URL + '" ';
        bubbleString += 'data-pbicon="' + objArea.Icon + '" ';
        bubbleString += '>';
        bubbleString += '<span class="logo">' + bubbleData.Logo + '</span>';
        bubbleString += '<span class="counter">' + bubbleData.Count + '</span>';
        bubbleString += '</div>';
    }

    return bubbleString;
}

// Process Diagram : Comment Bubble : Container Position
function commentBubbleContainerPostition(targetImg, processName) {
    var mainContainer = $('#DMapWrap').closest('table');
    var bubbleContainer = $('#DMapCommentBubbleContainer');

    bubbleContainer.css({ 'width': bubbleContainer.parent().find('img').width() });

    switch (processName) {
        case '':
            mainContainer.css({
                'min-width': '',
                'min-height': ''
            });
            break;
        case 'reset':
            mainContainer.css({
                'min-width': '',
                'min-height': ''
            });
            break;
        case 'zoom':
            mainContainer.css({
                'min-width': targetImg.width() + parseInt(targetImg.css('left').replace(/px/i, '')) + 20,
                'min-height': targetImg.height() + parseInt(targetImg.css('top').replace(/px/i, '')) + 20
            });
            break;
        case 'draggable':
            mainContainer.css({
                'min-width': targetImg.width() + parseInt(targetImg.css('left').replace(/px/i, '')) + 20,
                'min-height': targetImg.height() + parseInt(targetImg.css('top').replace(/px/i, '')) + 20
            });
            break;
    }

}

// Process Diagram : Comment Bubble : Toggle
function toggleCommentBubble(target) {
    var handle = $('#DMapCommentBubbleContainer').find('.DMapCommentBubble');
    handle.toggle();

    var enabledDiscussion = target.attr('data-value').toLowerCase();
    if (enabledDiscussion == 'true') {
        target.find('i').removeClass('fa-comment-slash');
        target.attr('data-original-title', 'Show Discussions');
        target.parent().find('.tooltip-inner').html('Show Discussions');

        target.attr('data-value', 'false');
        $("#EnableDiagramDiscussion").val('False');
    } else {
        target.find('i').addClass('fa-comment-slash');
        target.attr('data-original-title', 'Hide Discussions');
        target.parent().find('.tooltip-inner').html('Hide Discussions');

        target.attr('data-value', 'true');
        $("#EnableDiagramDiscussion").val('True');
    }
}

// Process Diagram : Comment Bubble : Toggle
function toggleIntegrateBubble(target) {
    var handle = $('#DMapCommentBubbleContainer').find('.DMapIntegrationBubble');
    handle.toggle();

    var enabledIntegratedApp = target.attr('data-value').toLowerCase();
    if (enabledIntegratedApp == 'true') {
        target.find('i').removeClass('fa-code-slash');
        target.attr('data-original-title', 'Show Integrated Apps');
        target.parent().find('.tooltip-inner').html('Show Integrated Apps');

        target.attr('data-value', 'false');
        $("#EnableDiagramIntegratedApps").val('False');
    } else {
        target.find('i').addClass('fa-code-slash');
        target.attr('data-original-title', 'Hide Integrated Apps');
        target.parent().find('.tooltip-inner').html('Hide Integrated Apps');

        target.attr('data-value', 'true');
        $("#EnableDiagramIntegratedApps").val('True');
    }
}

// Process Diagram : Connection Bubble : Position
function connectionBubblePosition() {
    var targetID = $('#DMapConnectionBubbleContainer');

    var connectBubbleList = targetID.find('.DMapConnectionBubble');
    var connectBubbleData = [];

    $(connectBubbleList).each(function () {
        var dataVal = {
            guid: $(this).attr('data-guid')
        }
        connectBubbleData.push(dataVal);
    });

    for (i = 0; i < connectBubbleData.length; i++) {
        var targetArea = $('area[data-guid="' + connectBubbleData[i].guid + '"]');
        var targetBubble = $('.DMapConnectionBubble[data-guid="' + connectBubbleData[i].guid + '"]');

        var targetAreaCoords = targetArea.attr('coords').split(',');

        targetBubble.css({
            "left": targetAreaCoords[2] + 'px',
            "top": targetAreaCoords[3] + 'px'
        })
    }
}

// Process Diagram : Connection Bubble : Area Focus
function setAreaFocus(targetGUID) {

    // Map Area : Turn off all hilight
    $('area').data('maphilight', { alwaysOn: false }).trigger('alwaysOn.maphilight');

    // Map Area : Turn on one hilight for Clicked Area
    $('area[data-guid="' + targetGUID + '"]').data('maphilight', { alwaysOn: true }).trigger('alwaysOn.maphilight');
}

// Process Diagram : Connection Bubble : Area Scroll Position
function setAreaScrollPosition(targetGUID) {
    var target = $('area[data-guid="' + targetGUID + '"]');
    var parent = target.closest('.mapAreaContent');
    var targetCoords = target.attr('coords').split(',');
    var targetLeft = targetCoords[2] - 50;

    parent.animate({ scrollLeft: targetLeft }, 400);
}

// Tooltip Control
function addToolTip() {
    // var IsTouch = 'ontouchstart' in window || navigator.maxTouchPoints;
    // IsTouch ? '' : $('[data-toggle="tooltip"]').tooltip();
}

function CallBackGetDiagramAndDiagramObjects(responseData, DiagramInfo) {
    finLoading(".pdDiagram");
    // Show Map Action
    $(".mapAreaAction a").css('display', 'block');
    finLoading(".pdActivities");
    $('.mapAreaLoaderContent').hide();
    try {
        if (responseData.d.status == "success") {

            var target = $("#DMapWrap");
            // Diagram : Map Area : Append Diagram Data
            target.html(responseData.d.Diagram);

            if ($("#DMapWrap").find('img').length > 0) {
                // Empty Map Data.
                var HTMLMapRefId = $("#DMapWrap").find('img').attr('usemap').replace('#', '');
                var HTMLEmptyMap = '<map id=' + HTMLMapRefId + ' name=' + HTMLMapRefId + '><area target="_self" style="outline:none;" coords="0,0,0,0" shape="rect" href="#" title="" data-guid="" data-type="" data-iscomposite="" data-diagramcount="" data-compositediagram="" data-diagramguid="" data-locked="" data-url="" data-stereotype="" data-technology="" data-basetype=""></area></map>'

                // Check if the map data is available, else append an empty map to make sure the plugins to work.
                var HTMLMap = (typeof (responseData.d.HTMLMap) != "undefined" && $(responseData.d.HTMLMap).length > 0) ? responseData.d.HTMLMap : HTMLEmptyMap;

                $("#DMapWrap").append(HTMLMap); // Append Map Data.

                var targetIMG = $('#DMapWrap img[usemap]');
                // Diagram : Map Area : hilight
                targetIMG.maphilight({ strokeColor: ThemeData.Link.Default.replace('#', ''), strokeWidth: 2, strokeOpacity: 1 });
                // Diagram : Map Area : Zoom
                targetIMG.zoomable({ mouseWheel: false });

                // When Loaded threw Diagram Refresh btn
                finLoading(".mapAreaContent");
                $(".mapAreaContent").css('overflow', '');
            }
            if (typeof (responseData.d.diagramObjects) != "undefined" && $(responseData.d.diagramObjects).length > 0) {
                var connectionBubbleContainer = '<div class="DMapConnectionBubbleContainer" id="DMapConnectionBubbleContainer"></div>';
                $("#DMapWrap").append(connectionBubbleContainer);
                var bubbleString = "";
                var bubbleContainer = $('#DMapConnectionBubbleContainer');
                //Script for connector display **** Ends*****..
            }

        } else {
            //Hide diagram controls.
            $(".mapAreaAction a").hide();

            // When Loaded threw Diagram Refresh btn
            finLoading(".mapAreaContent");
            $(".mapAreaContent").css('overflow', '');

            $("#DMapWrap").html('<span class="noData">Error on loading Diagram.<br /><button class="btn btn-theme" onclick="LoadDiagramForArtifact(' + DiagramInfo.loadDiscussions + ',' + DiagramInfo.GetConnectorInfo + ',' + DiagramInfo.GetExternalAppCount + ')">Retry</button></span>');
        }

        delete diagramObjects["context"]
        delete diagramObjects["length"]
        delete diagramObjects["prevObject"]

        $(".mapAreaContainer").removeClass('mapAreaLoading');  // Remove Diagram Component Loader
    } catch (e) {
    }

    //Bind discussion filter content on the DOM.
    try {
        customScrollbarObj($('.customScrollbar')); // Custom Scroll
        finLoading(".process-discussion-filter-body");
    } catch (e) {

    }

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

var includeRecursive = false;

$(function () {
    $.xhrPool = [];
    $.xhrPool.abortAll = function () {
        $(this).each(function (i, jqXHR) {   //  cycle through list of recorded connection
            jqXHR.abort();  //  aborts connection
            $.xhrPool.splice(i, 1); //  removes from list by index
        });
    }
});

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
    // handleAjaxRequest(null, true, "API/Request.aspx/GetArtifactsAPI", data, "CallBackGetArtifacts1");
    try {
        var url1 = "/rest/prolaborate-admin/1.0/ProlabGetArtifacts";
        var data = '{"repositoryId":"' + repositoryId + '", "Guid":"' + elementId + '", "ElementType":"' + elementType + '", "parentguids":"", "IncludeRecursive": false}';
        handleAjaxRequest(null, true, url1, data, "CallBackGetArtifacts1")
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
            fitToScreen();
            var targetIMG = $('#DMapWrap img[usemap]');
            // Diagram : Map Area : hilight
            targetIMG.maphilight({ strokeColor: '08a2ee', strokeWidth: 2, strokeOpacity: 1 });
            // Diagram : Map Area : Zoom
            targetIMG.zoomable({ mouseWheel: false });
            fitToScreen();
            if (responseData.d.GroupProperties['All - All'].count > 0) {
                $(".elementTraceabilityDetails").removeClass("hidden");
                $(".childrenGrouping").removeClass("hidden");
            }
            else { return false; }
            setWindowHeight();
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
                var includeRecursive = false;
                //var ReqData = "{repositoryId:'" + repositoryId + "', ElementGuid:'" + elementId + "', ElementType:'" + elementType + "', includeRecursive:" + includeRecursive + ", GroupKey:'" + value + "'}";
                //handleAjaxRequest(null, true, "API/Request.aspx/GetTabaleColumnsByGroupKeyAPI", ReqData, "CallBackGetTabaleColumnsByGroupKey");

                var url1 = "/rest/prolaborate-admin/1.0/ProlabGetTabaleColumnsByGroupKey";
                var data = '{"repositoryId":"' + repositoryId + '", "Guid":"' + elementId + '", "ElementType":"' + elementType + '", "IncludeRecursive":' + includeRecursive + ', "GroupKey":"' + value + '"}';
                handleAjaxRequest(null, true, url1, data, "CallBackGetTabaleColumnsByGroupKey");

                //console.log(ColumnKeys);
                //updateArtifactList(ColumnKeys);
            }
        }
        else {

        }
    }
    catch (e) {
    }
}

function CallBackGetTabaleColumnsByGroupKey(responseData) {
    //console.log(responseData);
    //finLoading(".childrenElementList");
    try {
        if (responseData.d.status == 'success') {
            setWindowHeight();
            if (typeof (responseData.d.GroupProperties) != "undefined" && Object.keys(responseData.d.GroupProperties).length > 0) {
                //Sorting list by alphabetical order.
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

                    var Checkedvalue = false;
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

                    //var requestData = "{repositoryId:'" + repositoryId + "', ElementGuid:'" + elementId + "', ElementType:'" + elementType + "',includeRecursive: " + Checkedvalue + ",GroupKey:'" + value + "', TableDraw:" + draw + ",StartIndex:" + startIndex + ",RowLength:" + length + ",SearchValue:'" + searchValue + "', dtrepcolumns:" + DtFilterColumnsString + "}";

                    var requestData = '{"repositoryId":"' + repositoryId + '", "Guid":"' + elementId + '", "ElementType":"' + elementType + '", "parentguids":"","IncludeRecursive": ' + Checkedvalue + ',"GroupKey":"' + value + '", "TableDraw":' + draw + ',"StartIndex":' + startIndex + ',"RowLength":' + length + ',"SearchValue":"' + searchValue + '", "dtrepcolumns":' + DtFilterColumnsString + '}';


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
                                    //var data = "{elementGuid:'" + elementGuid + "', RepositoryId:'" + repositoryId + "', UserId:'" + userId + "'}";
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

//Adjust I-Frame height -Dj -v1.8
function setWindowHeight() {
    var Height = $(".pdDiagramWrap").height();
    var windowHeight = parseInt(Height) + 20;
    $('iframe#' + IframeRandomId + '', parent.document).attr("style", "height:" + windowHeight + "px;border:0");
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
                                    rowdata[key] = '<i class="pbicon ' + pbiconClass + '"></i>&nbsp;' + escapeHtml(responseData.d.elementProperties[key]);//Esacape Html content in Diagram childern table -DJ
                                    rowObj.attr("data-pbicon", pbiconClass);
                                }
                                else if (key == "Created") {
                                    rowdata[key] = responseData.d.elementProperties["CreatedDateString"];
                                }
                                else if (key == "Modified") {
                                    rowdata[key] = responseData.d.elementProperties["ModifiedDateString"];
                                }
                                else {
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
        var includeRecursive = false;

        //var ReqData = "{repositoryId:'" + repositoryId + "', ElementGuid:'" + elementId + "', ElementType:'" + elementType + "', includeRecursive:" + includeRecursive + ", GroupKey:'" + value + "'}";
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
        
        window.open(requestURL + (targetData.ShareURL).split("*")[0],'_blank');
        return false;
    } catch (e) {
        console.log(e);
    }
});

// Element DropDown : On Artifact Diagram
function OpenAreaWidgetSglClick(e, obj) {
    try {
        if (enablelink == 0) { return false; }

        // Map Area : Turn off all hilight
        $("area").data('maphilight', { alwaysOn: false }).trigger('alwaysOn.maphilight');

        // Map Area : Turn on one hilight for Clicked Area
        obj.data('maphilight', { alwaysOn: true }).trigger('alwaysOn.maphilight');

        var target = $(e.target);
        var parent = target.closest('.mapAreaContent')
        var footerWrap = parent.find('.dropOverflow');
        var targetData = {
            "Guid": target.attr('data-guid'),
            "Name": target.attr('title'),
            "Type": target.attr('data-type'),
            "BaseType": target.attr('data-basetype'),
            "Technology": target.attr('data-technology'),
            "Stereotype": target.attr('data-stereotype'),
            "IsLocked": target.attr('data-locked'),
            "IsComposite": target.attr('data-iscomposite'),
            "CompositeDiagram": target.attr('data-compositediagram'),
            "ShareURL": target.attr('data-url'),
            "Icon": target.attr('data-pbicon'),
            "QuickInfo": false
        }

        window.open(requestURL + (targetData.ShareURL).split("*")[0],'_blank');

        return false;
    } catch (e) {
        console.log(e);
    }
}

//commom ajax request method.
function handleAjaxRequest(timeOut, async, requestMethod, dataContent, callBackMethodName, option) {
    var responseData;
    urlValue = RequestFullUrl +  requestMethod;
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

function htmlDecode(value) {
    return $('<div/>').html(value).text();
}

$(document).on('click', '.DiagramNavigation', function () {
    var url = $(this).attr("data-url");
    NavigatioinURL = requestURL + "/" + url;
    window.open(NavigatioinURL, '_blank');
});