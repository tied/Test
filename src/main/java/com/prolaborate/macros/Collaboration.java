package com.prolaborate.macros;

import com.atlassian.confluence.content.render.xhtml.ConversionContext;
import com.atlassian.confluence.content.render.xhtml.XhtmlException;
import com.atlassian.confluence.macro.Macro;
import com.atlassian.confluence.macro.MacroExecutionException;
import com.atlassian.confluence.setup.settings.SettingsManager;
import com.atlassian.confluence.xhtml.api.MacroDefinition;
import com.atlassian.confluence.xhtml.api.MacroDefinitionHandler;
import com.atlassian.confluence.xhtml.api.XhtmlContent;
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
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Scanned
public class Collaboration implements Macro {

	private final XhtmlContent xhtmlUtils;
	private final PluginSettingsFactory pluginSettingsFactory;
	@ConfluenceImport
    private PageBuilderService pageBuilderService;
	
    @Autowired
    public Collaboration(PageBuilderService pageBuilderService, @ComponentImport XhtmlContent xhtmlUtils, @ComponentImport PluginSettingsFactory pluginSettingsFactory) {
    	com.prolaborate.configureui.ConfigResource.log.info("Collaboration Initiated"+"\n");
    	
    	this.xhtmlUtils = xhtmlUtils;
        this.pluginSettingsFactory = pluginSettingsFactory;
        this.pageBuilderService = pageBuilderService;
    }

    public String execute(Map<String, String> params, String bodyContent, ConversionContext conversionContext) throws MacroExecutionException {
    	
    	
        String body = conversionContext.getEntity().getBodyAsString();
        final List<MacroDefinition> macros = new ArrayList<MacroDefinition>();
        //String Name = params.get("Name");
        String Type = params.get("Type");
		String Guid = "{"+params.get("Guid")+"}";
		String ShowChildren = params.get("ShowChildren");
		String EnableLink = params.get("EnableLink");
		
		switch(Type) {
			case "Element":
			case "Package":
				pageBuilderService.assembler().resources().requireWebResource("com.prolaborate.macros.prolaboratemacro:prolaboratemacro-elementresources");
				break;
			case "Diagram":
				pageBuilderService.assembler().resources().requireWebResource("com.prolaborate.macros.prolaboratemacro:prolaboratemacro-diagramresources");
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
        /*builder.append("<p>");
        if (!macros.isEmpty()) {
            builder.append("<table width=\"50%\">");
            builder.append("<tr><th>Macro Name</th><th>Has Body?</th></tr>");
            for (MacroDefinition defn : macros) {
                builder.append("<tr>");
                builder.append("<td>").append(defn.getName()).append("</td><td>").append(defn.hasBody()).append("</td>");
                builder.append("</tr>");
            }
            builder.append("</table>");
        } else {
            builder.append("You've done built yourself a macro! Nice work.");
        }
        builder.append("</p>");*/
        SettingsManager settingsManager = (SettingsManager) ContainerManager.getComponent("settingsManager");
		String baseUrl = settingsManager.getGlobalSettings().getBaseUrl();
			
			
        PluginSettings settings = pluginSettingsFactory.createGlobalSettings();
        String protocol = (String) settings.get(com.prolaborate.configureui.ConfigResource.Config.class.getName()+ ".protocol");
        String serverUrl = (String) settings.get(com.prolaborate.configureui.ConfigResource.Config.class.getName()+ ".server");
        String port = (String) settings.get(com.prolaborate.configureui.ConfigResource.Config.class.getName()+ ".port");
        String repositoryId = (String) settings.get(com.prolaborate.configureui.ConfigResource.Config.class.getName()+ ".repositoryId");
        String token = (String) settings.get(com.prolaborate.configureui.ConfigResource.Config.class.getName()+ ".token");
        HttpURLConnection connection = null;
        try {
        //String uri = "https://team.prolaborate.com/Assets/Templates/ASP/Discussion/Discussion.aspx?repId=702d90a7-3ecc-4af2-881b-71eace10d7f7&procId={2722FCD0-5C34-4f4b-923A-052CF68E1919}";
    	//String uri = "http://100.0.0.17:52232/Assets/Templates/ASP/Discussion/Discussion.aspx?repId=a0437463-a34b-4c0e-9bbd-6894626bce5c&procId={0686F59B-8EC5-411a-9F3A-202CDE5ECFF8}";
		String uri = ""+protocol+"://"+serverUrl+":"+port+"/Assets/Templates/ASP/";
		switch(Type) {
		case "Element":
		case "Package":
			uri += "Element/Element.aspx?repId="+repositoryId+"&procId="+Guid+"&showTable="+ShowChildren+"&enablelink="+EnableLink+"";
			break;
		case "Diagram":
			uri += "Diagram/Diagram.aspx?repId="+repositoryId+"&procId="+Guid+"&showTable="+ShowChildren+"&enablelink="+EnableLink+"";
			break;
		case "Discussions":
			uri += "Discussion/Discussion.aspx?repId="+repositoryId+"&procId="+Guid+"&showTable="+ShowChildren+"&enablelink="+EnableLink+"";
			break;
		}
		
    	URL url = new URL(uri);
    	System.setProperty("http.agent", "");
		connection = (HttpURLConnection) url.openConnection();
    	connection.setRequestMethod("GET");
		connection.setRequestProperty("REFERER",baseUrl);
		connection.setRequestProperty("proltoken",token);
    	connection.setRequestProperty("User-Agent", System.getProperty("http.agent"));
		//connection.setRequestProperty("Accept", "application/xml");
    	connection.connect();
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
                builder.append(sb.toString());
                //builder.append("</p>");
        }
    	//JAXBContext jc = JAXBContext.newInstance(Post.class);
    	//InputStream xml = connection.ge();
    	//Customer customer = (Customer) jc.createUnmarshaller().unmarshal(xml);
    	connection.disconnect();
        } catch (MalformedURLException ex) {
        	builder.append("<p>");
            builder.append("Malformed url exception occured : " + ex.getMessage());
            builder.append("</p>");
            com.prolaborate.configureui.ConfigResource.log.error("API Request URL MalformedURLException: "+ex.getMessage()+"\n");
        } catch (IOException ex) {
        	builder.append("<p>");
            builder.append("IO Exception occured : " + ex.getMessage());
            builder.append("</p>");
            com.prolaborate.configureui.ConfigResource.log.error("API Request URL IOException: "+ex.getMessage()+"\n");
        } catch (Exception ex) {
        	builder.append("<p>");
            builder.append("General Exception occured : " + ex.getMessage());
            builder.append("</p>");
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

    public BodyType getBodyType() {
        return BodyType.NONE;
    }

    public OutputType getOutputType() {
        return OutputType.BLOCK;
    }

}
