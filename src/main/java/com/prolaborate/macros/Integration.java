package com.prolaborate.macros;

import com.atlassian.confluence.content.render.xhtml.ConversionContext;
import com.atlassian.confluence.content.render.xhtml.XhtmlException;
import com.atlassian.confluence.macro.Macro;
import com.atlassian.confluence.macro.MacroExecutionException;
import com.atlassian.confluence.setup.settings.SettingsManager;
import com.atlassian.confluence.util.HtmlUtil;//DJ
import com.atlassian.confluence.xhtml.api.MacroDefinition;
import com.atlassian.confluence.xhtml.api.MacroDefinitionHandler;
import com.atlassian.confluence.xhtml.api.XhtmlContent;
import com.atlassian.json.jsonorg.JSONObject;
import com.atlassian.plugin.spring.scanner.annotation.component.Scanned;
import com.atlassian.plugin.spring.scanner.annotation.imports.ComponentImport;
import com.atlassian.plugin.spring.scanner.annotation.imports.ConfluenceImport;
import com.atlassian.sal.api.pluginsettings.PluginSettings;
import com.atlassian.sal.api.pluginsettings.PluginSettingsFactory;
import com.atlassian.spring.container.ContainerManager;
import com.atlassian.webresource.api.assembler.PageBuilderService;

import org.springframework.beans.factory.annotation.Autowired;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.ConnectException;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;//DJ -V1.9

@Scanned
public class Integration implements Macro {

	private final XhtmlContent xhtmlUtils;
	private final PluginSettingsFactory pluginSettingsFactory;
	@ConfluenceImport
    private PageBuilderService pageBuilderService;
	
    @Autowired
    public Integration(PageBuilderService pageBuilderService, @ComponentImport XhtmlContent xhtmlUtils, @ComponentImport PluginSettingsFactory pluginSettingsFactory) {
    	com.prolaborate.configureui.ConfigResource.log.info("Integration Initiated"+"\n");
    	
    	this.xhtmlUtils = xhtmlUtils;
        this.pluginSettingsFactory = pluginSettingsFactory;
        this.pageBuilderService = pageBuilderService;
    }

    public String execute(Map<String, String> params, String bodyContent, ConversionContext conversionContext) throws MacroExecutionException {
    	
    	
        String body = conversionContext.getEntity().getBodyAsString();
        final List<MacroDefinition> macros = new ArrayList<MacroDefinition>();
       
	   String DynamicRepositoryId = "";
		
		if(params.get("repositoryId")!=null)
         DynamicRepositoryId = params.get("repositoryId");
	
        //String Name = params.get("Name");
        String Type = params.get("Type");
		String Guid = "{"+params.get("Guid")+"}";
		String ShowChildren = params.get("ShowChildren");
		String EnableLink = params.get("EnableLink");
		String EnablePath = params.get("EnablePath");
        if(EnablePath == null || EnablePath == "" || EnablePath == "undefined"){ //show/hide FQPath -DJ -V1.11
            EnablePath = "1";
        }
		String EnableBorder = params.get("EnableBorder");
        if(EnableBorder == null || EnableBorder == "" || EnableBorder == "undefined"){ //show/hide border -DJ -V1.11
        	EnableBorder = "1";
        }
		String ErrorMessage="";
		String ErrorLink = "";
		switch(Type) {
			case "Element":
			case "Package":
				pageBuilderService.assembler().resources().requireWebResource("com.prolaborate.macros.prolaborate-macro:prolaboratemacro-elementresources");
				break;
			case "Diagram":
				pageBuilderService.assembler().resources().requireWebResource("com.prolaborate.macros.prolaborate-macro:prolaboratemacro-diagramresources");
				break;
		}
		
        try {
            xhtmlUtils.handleMacroDefinitions(body, conversionContext, new MacroDefinitionHandler() {
                public void handle(MacroDefinition macroDefinition) {
                    macros.add(macroDefinition);
                }
            });
        } catch (XhtmlException e) {
        	com.prolaborate.configureui.ConfigResource.log.error("API Request URL XhtmlException: "+e.getMessage()+"\n");
            throw new MacroExecutionException(e);
        }

        StringBuilder builder = new StringBuilder();
        
        SettingsManager settingsManager = (SettingsManager) ContainerManager.getComponent("settingsManager");
		String baseUrl = settingsManager.getGlobalSettings().getBaseUrl();
		
        PluginSettings settings = pluginSettingsFactory.createGlobalSettings();
        String protocol = (String) settings.get(com.prolaborate.configureui.ConfigResource.Config.class.getName()+ ".protocol");
        String serverUrl = (String) settings.get(com.prolaborate.configureui.ConfigResource.Config.class.getName()+ ".server");
        String port = (String) settings.get(com.prolaborate.configureui.ConfigResource.Config.class.getName()+ ".port");
        String repositoryId = (String) settings.get(com.prolaborate.configureui.ConfigResource.Config.class.getName()+ ".repositoryId");
        String token = (String) settings.get(com.prolaborate.configureui.ConfigResource.Config.class.getName()+ ".token");
        String userid = (String) settings.get(com.prolaborate.configureui.ConfigResource.Config.class.getName()+ ".userid");
        
		if(DynamicRepositoryId!="")
			repositoryId=DynamicRepositoryId;
		
        HttpURLConnection connection = null;
        try {
        String uri = ""+protocol+"://"+serverUrl+":"+port+"/Assets/Templates/ASP/";
		switch(Type) {
		case "Element":
		case "Package":
			uri += "Element/Element.aspx?repId="+repositoryId+"&procId="+Guid+"&showTable="+ShowChildren+"&enablelink="+EnableLink+"&enablePath="+EnablePath+"&enableBorder="+EnableBorder+"&restrictCss=true"; //added two query string to show/hide path and border -DJ -V1.11
			break;
		case "Diagram":
			uri += "Diagram/Diagram.aspx?repId="+repositoryId+"&procId="+Guid+"&showTable="+ShowChildren+"&enablelink="+EnableLink+"&enablePath="+EnablePath+"&enableBorder="+EnableBorder+"&restrictCss=true"; //added two query string to show/hide path and border -DJ -V1.11
			break;
		case "Discussions":
			uri += "Discussion/Discussion.aspx?repId="+repositoryId+"&procId="+Guid+"&showTable="+ShowChildren+"&enablelink="+EnableLink+"&enablePath="+EnablePath+"&enableBorder="+EnableBorder+"&restrictCss=true"; //added two query string to show/hide path and border -DJ -V1.11
			break;
		}
		
    	URL url = new URL(uri);
    	System.setProperty("http.agent", "");
    	
		connection = (HttpURLConnection) url.openConnection();
		connection.setRequestMethod("POST");
		connection.setRequestProperty("content-type", "application/json; charset=utf-8");
		connection.setRequestProperty("REFERER",baseUrl);
		connection.setRequestProperty("proltoken",token);
    	connection.setRequestProperty("User-Agent", System.getProperty("http.agent"));
    	connection.setDoOutput(true);
		 JSONObject sendObject = new JSONObject();
		 sendObject.putOpt("UserLogId", userid);
		//connection.setRequestProperty("Accept", "application/xml");
		//connection.connect();
			OutputStreamWriter wr= new OutputStreamWriter(connection.getOutputStream(),
				     Charset.forName("UTF-8").newEncoder());
			wr.write(sendObject.toString());
			wr.flush();
			int status = connection.getResponseCode();

        switch (status) {
            case 200:
            case 201:
                BufferedReader br = new BufferedReader(new InputStreamReader(connection.getInputStream(), Charset.forName("UTF-8").newDecoder()));
                StringBuilder sb = new StringBuilder();
                //sb.append("<h1>"+ uri +"</h1>");
                String line;
                while ((line = br.readLine()) != null) {
                    sb.append(line+"\n");
                }
                br.close();
                //builder.append("<p>");
                //builder.append(sb.toString());
                //builder.append("</p>");
                //append retun html content to iframe to support multiple macro -DJ -V1.9
                String Styles = "";        
                Styles = Styles + "<link rel=\"stylesheet\" type=\"text/css\" href=\"" + baseUrl + "/s/p/_/download/resources/com.prolaborate.macros.prolaborate-macro:prolaboratemacro-diagramresources/prolaboratemacro.css\"/>";
                Styles = Styles + "<link rel=\"stylesheet\" type=\"text/css\" href=\"" + baseUrl + "/s/p/_/download/resources/com.prolaborate.macros.prolaborate-macro:prolaboratemacro-elementresources/elementview/font-awesome-4.7.0/css/font-awesome.min.css\"/>";
                Styles = Styles + "<link rel=\"stylesheet\" type=\"text/css\" href=\"" + baseUrl + "/s/p/_/download/resources/com.prolaborate.macros.prolaborate-macro:prolaboratemacro-elementresources/elementview/PBAwesome/css/PBAwesome.css\"/>";
                Styles = Styles + "<link rel=\"stylesheet\" type=\"text/css\" href=\"" + baseUrl + "/s/p/_/download/resources/com.prolaborate.macros.prolaborate-macro:prolaboratemacro-elementresources/elementview/bootstrap-dropdown/css/bootstrap-dropdown.css\"/>";
                Styles = Styles + "<link rel=\"stylesheet\" type=\"text/css\" href=\"" + baseUrl + "/s/p/_/download/resources/com.prolaborate.macros.prolaborate-macro:prolaboratemacro-elementresources/elementview/bootstrap-dropdown/css/bootstrap-dropdown-theme.min.css\"/>";
                Styles = Styles + "<link rel=\"stylesheet\" type=\"text/css\" href=\"" + baseUrl + "/s/p/_/download/resources/com.prolaborate.macros.prolaborate-macro:prolaboratemacro-elementresources/elementview/switchery-master/switchery.min.css\"/>";
                //styles included in confluence instead of prolaborate -DJ -V1.11
                Styles = Styles + "<link rel=\"stylesheet\" type=\"text/css\" href=\"" + baseUrl + "/s/p/_/download/resources/com.prolaborate.macros.prolaborate-macro:prolaboratemacro-elementresources/elementview/PBIconSet/default.css\"/>";
                Styles = Styles + "<link rel=\"stylesheet\" type=\"text/css\" href=\"" + baseUrl + "/s/p/_/download/resources/com.prolaborate.macros.prolaborate-macro:prolaboratemacro-elementresources/elementview/PBIconSet/general.css\"/>";
                Styles = Styles + "<link rel=\"stylesheet\" type=\"text/css\" href=\"" + baseUrl + "/s/p/_/download/resources/com.prolaborate.macros.prolaborate-macro:prolaboratemacro-elementresources/elementview/PBIconSet/uml.css\"/>";
                Styles = Styles + "<link rel=\"stylesheet\" type=\"text/css\" href=\"" + baseUrl + "/s/p/_/download/resources/com.prolaborate.macros.prolaborate-macro:prolaboratemacro-elementresources/elementview/PBIconSet/bpmn.css\"/>";
                Styles = Styles + "<link rel=\"stylesheet\" type=\"text/css\" href=\"" + baseUrl + "/s/p/_/download/resources/com.prolaborate.macros.prolaborate-macro:prolaboratemacro-elementresources/elementview/PBIconSet/archimate.css\"/>";
                Styles = Styles + "<link rel=\"stylesheet\" type=\"text/css\" href=\"" + baseUrl + "/s/p/_/download/resources/com.prolaborate.macros.prolaborate-macro:prolaboratemacro-elementresources/elementview/PBIconSet/archimate3.css\"/>";
                Styles = Styles + "<link rel=\"stylesheet\" type=\"text/css\" href=\"" + baseUrl + "/s/p/_/download/resources/com.prolaborate.macros.prolaborate-macro:prolaboratemacro-elementresources/elementview/PBIconSet/whiteboard.css\"/>";
                
                Styles = Styles + "<link rel=\"stylesheet\" type=\"text/css\" href=\"" + baseUrl + "/s/p/_/download/resources/com.prolaborate.macros.prolaborate-macro:prolaboratemacro-elementresources/elementview/bootstrap-4.2.1-dist/css/bootstrap.css\"/>";
                Styles = Styles + "<link rel=\"stylesheet\" type=\"text/css\" href=\"" + baseUrl + "/s/p/_/download/resources/com.prolaborate.macros.prolaborate-macro:prolaboratemacro-elementresources/elementview/bootstrap-select-1.13.3/css/bootstrap-select.min.css\"/>";
                Styles = Styles + "<link rel=\"stylesheet\" type=\"text/css\" href=\"" + baseUrl + "/s/p/_/download/resources/com.prolaborate.macros.prolaborate-macro:prolaboratemacro-elementresources/elementview/DataTables-1.10.18/css/dataTables.bootstrap4.css\"/>";
                Styles = Styles + "<link rel=\"stylesheet\" type=\"text/css\" href=\"" + baseUrl + "/s/p/_/download/resources/com.prolaborate.macros.prolaborate-macro:prolaboratemacro-elementresources/elementview/DataTables-1.10.18/css/dataTables.custom.css\"/>";
                String Script = "";
                Script = Script + "<script type=\"text/javascript\" src=\"" + baseUrl + "/s/p/_/download/resources/com.prolaborate.macros.prolaborate-macro:prolaboratemacro-elementresources/elementview/jquery/1.11.3/jquery.min.js\"></script>";
                Script = Script + "<script type=\"text/javascript\" src=\"" + baseUrl + "/s/p/_/download/resources/com.prolaborate.macros.prolaborate-macro:prolaboratemacro-elementresources/elementview/bootstrap-dropdown/js/bootstrap-dropdown.js\"></script>";
                Script = Script + "<script type=\"text/javascript\" src=\"" + baseUrl + "/s/p/_/download/resources/com.prolaborate.macros.prolaborate-macro:prolaboratemacro-elementresources/elementview/bootstrap-select-1.13.3/js/bootstrap-select.js\"></script>";
                Script = Script + "<script type=\"text/javascript\" src=\"" + baseUrl + "/s/p/_/download/resources/com.prolaborate.macros.prolaborate-macro:prolaboratemacro-elementresources/elementview/switchery-master/switchery.min.js\"></script>";
                Script = Script + "<script type=\"text/javascript\" src=\"" + baseUrl + "/s/p/_/download/resources/com.prolaborate.macros.prolaborate-macro:prolaboratemacro-elementresources/elementview/DataTables-1.10.18/js/jquery.dataTables.min.js\"></script>";
                Script = Script + "<script type=\"text/javascript\" src=\"" + baseUrl + "/s/p/_/download/resources/com.prolaborate.macros.prolaborate-macro:prolaboratemacro-elementresources/elementview/DataTables-1.10.18/js/dataTables.bootstrap4.min.js\"></script>";
                Script = Script + "<script type=\"text/javascript\" src=\"" + baseUrl + "/s/p/_/download/resources/com.prolaborate.macros.prolaborate-macro:prolaboratemacro-elementresources/elementview/moment/moment.min.js\"></script>";
                switch (Type) { 
                case "Element":
                case "Package":
                	Styles = Styles + "<link rel=\"stylesheet\" type=\"text/css\" href=\"" + baseUrl + "/s/p/_/download/resources/com.prolaborate.macros.prolaborate-macro:prolaboratemacro-elementresources/elementview/custom.css\"/>";
                	Script = Script + "<script type=\"text/javascript\" src=\"" + baseUrl + "/s/p/_/download/resources/com.prolaborate.macros.prolaborate-macro:prolaboratemacro-elementresources/element_custom.js\"></script>";
                	break;
                case "Diagram":
                	Styles = Styles + "<link rel=\"stylesheet\" type=\"text/css\" href=\"" + baseUrl + "/s/p/_/download/resources/com.prolaborate.macros.prolaborate-macro:prolaboratemacro-diagramresources/diagramview/custom.css\"/>";
                    Script = Script + "<script type=\"text/javascript\" src=\"" + baseUrl + "/s/p/_/download/resources/com.prolaborate.macros.prolaborate-macro:prolaboratemacro-diagramresources/diagramview/maphilight/jquery.maphilight.js\"></script>";
                    Script = Script + "<script type=\"text/javascript\" src=\"" + baseUrl + "/s/p/_/download/resources/com.prolaborate.macros.prolaborate-macro:prolaboratemacro-diagramresources/diagramview/jquery.zoomable/jquery.zoomable-1.2.js\"></script>";
                    Script = Script + "<script type=\"text/javascript\" src=\"" + baseUrl + "/s/p/_/download/resources/com.prolaborate.macros.prolaborate-macro:prolaboratemacro-diagramresources/diagram_view.js\"></script>";
                  break; 
                }
                Random rand = new Random();
                String encodedVal = HtmlUtil.htmlEncode(sb.toString());//Encode Html content -DJ
                int int_random = rand.nextInt(1000);
                String IframeId = "ProlIframeRandomId" + int_random;
                String result = Styles + encodedVal + "<script type=\"text/javascript\"> var EnablePath = \"" + EnablePath + "\"; var EnableBorder = \"" + EnableBorder + "\"; var Prol_IframeId = \"" + IframeId + "\"; var RequestFullUrl = \"" + baseUrl + "\"  </script>" + Script;

                String MacroData = "<div><iframe  width=\"100%\" id='" + IframeId + "' srcdoc='" + result + "' src=\"" + baseUrl + "/s/p/_/download/resources/com.prolaborate.macros.prolaborate-macro:prolaboratemacro-diagramresources/View/unsupported.html\" style=\"height:225px;border:0\"></iframe></div>";
                builder.append(MacroData);
				break;
			case 204:
				ErrorLink = "";
	            ErrorMessage = GenerateErrorMessage("Unable to retrieve information!","There is a problem getting required information. Please login to Prolaborate as the user configured in Confluence and check whether you are able to access information from EA models without any issues.",ErrorLink); // Added Error link -DJ -V1.11
	        	builder.append(ErrorMessage);
				break;
			case 403:
				ErrorLink = "https://prolaborate.sparxsystems.com/faq/confluence-integration/using-the-macro#unauthorized-request-or-authentication-failed";
	            ErrorMessage = GenerateErrorMessage("Unable to connect to Prolaborate","It looks like some settings or licenses have been changed in Prolaborate after it was configured in Confluence. Please check Prolaborate configuration.",ErrorLink); // Added Error link -DJ -V1.11
	        	builder.append(ErrorMessage);
	            break;
			default:
				ErrorLink = "";
				ErrorMessage = GenerateErrorMessage("Connection Failed","Currently Unable to connect to Prolaborate! Please try after sometime.",ErrorLink); // Added Error link -DJ -V1.11
	        	builder.append(ErrorMessage);
				break;
        }
    	//JAXBContext jc = JAXBContext.newInstance(Post.class);
    	//InputStream xml = connection.ge();
    	//Customer customer = (Customer) jc.createUnmarshaller().unmarshal(xml);
    	connection.disconnect();
        } catch (MalformedURLException ex) {
        	ErrorLink = "";
        	ErrorMessage = GenerateErrorMessage("API Request URL MalformedURLException:",ex.getMessage(),ErrorLink); // Added Error link -DJ -V1.11
        	builder.append(ErrorMessage);
        	com.prolaborate.configureui.ConfigResource.log.error("API Request URL MalformedURLException: "+ex.getMessage()+"\n");
        } catch (ConnectException ex) {
        	ErrorLink = "https://prolaborate.sparxsystems.com/faq/confluence-integration/using-the-macro#unauthorized-request-or-authentication-failed";
        	ErrorMessage= GenerateErrorMessage("Unable To Connect","Not able to connect with Prolaborate server! Please check and try again.",ErrorLink); // Added Error link -DJ -V1.11
        	builder.append(ErrorMessage);
            com.prolaborate.configureui.ConfigResource.log.error("API Request URL ConnectException: "+ex.getMessage()+"\n");
        }catch (IOException ex) {
        	ErrorLink = "";
        	ErrorMessage = GenerateErrorMessage("IOException Exception occured : ",ex.getMessage(),ErrorLink); // Added Error link -DJ -V1.11
        	builder.append(ErrorMessage);
            com.prolaborate.configureui.ConfigResource.log.error("API Request URL IOException: "+ex.getMessage()+"\n");
        } catch (Exception ex) {
        	ErrorLink = "";
        	ErrorMessage = GenerateErrorMessage("General Exception occured :",ex.getMessage(),ErrorLink); // Added Error link -DJ -V1.11
        	builder.append(ErrorMessage);
            com.prolaborate.configureui.ConfigResource.log.error("API Request URL Exception: "+ex.getMessage()+"\n");
        }
        finally {
           if (connection != null) {
              try {
            	  connection.disconnect();
              } catch (Exception ex) {
                 
              }
           }
        }
        return builder.toString();
        //return velTemplate;
    }
    
    public String GenerateErrorMessage(String MessageTile,String MessageContent,String ErrorLink) {
    	String LinkText = "";
    	if(ErrorLink != null && ErrorLink != "") { // show error link if exists -DJ -V1.11
    		LinkText = " <a href =\"" + ErrorLink + "\" target=\"_blank\">here</a>";
    	}
    	String ReturnHtml = "<div class=\"noDataAvailable\" id=\"ErrorMessage\" runat=\"server\" style=\"padding:100px;position: inherit !important;border-color: #f4f4f4;\r\n" + 
    			"    border-width: 10px;\r\n" + 
    			"    border-style: solid;\">\r\n" + 
    			"            <table style=\"width: 50% !important;\">\r\n" + 
    			"                <tbody>\r\n" + 
    			"                    <tr>\r\n" + 
    			"                        <td><i class=\"ProlaborateImageClass\"></i></td>\r\n" + 
    			"                                        \r\n" + 
    			"                        <td>\r\n" + 
    			"                            <h4 id=\"ErrorMessageHeading\" runat=\"server\">" + MessageTile + "</h4>\r\n" + 
    			"                                            \r\n" + 
    			"                            <p id=\"ErrorMessageDesc\" runat=\"server\">" + MessageContent + LinkText +"</p>\r\n" + 
    			"                        </td>\r\n" + 
    			"                                        \r\n" + 
    			"                    </tr>\r\n" + 
    			"                </tbody>\r\n" + 
    			"            </table>\r\n" + 
    			"        </div>";
    	return ReturnHtml;
    }
    
    public BodyType getBodyType() {
        return BodyType.NONE;
    }

    public OutputType getOutputType() {
        return OutputType.BLOCK;
    }

}
