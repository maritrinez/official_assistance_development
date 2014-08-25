library(ggplot2)
library(reshape)
setwd("~/Dropbox/AOD/")
options(stringsAsFactors = FALSE)

# Load the csv
AOD_eur <- read.csv("AOD_SEG_PACI_TOTAL.csv", header = T, sep=";")
AOD_eurCopy <- AOD_eur
AOD_eur <- AOD_eurCopy

# Load the CAD sectors
CAD <- read.csv("SectoresCAD.csv", header = T, sep = ";")

# Look at the data structure
str(AOD_eur)

# Change the variable names
colnames(AOD_eur)
names <- c("ID", "tipo", "agente", "agente_2", "titulo", "descripcion", "sectorCAD", "sectorCRS", "pais", "area", "renta", "prioridad", "AODneta", "año")
colnames(AOD_eur) <- names

# Unify 'tipo' variables value
unique(AOD_eur$tipo)
AOD_eur$tipo <- gsub("MUL", "Multilateral", AOD_eur$tipo)
AOD_eur$tipo <- gsub("BIL|Bil$", "Bilateral", AOD_eur$tipo)
AOD_eur$tipo <- gsub("MBI", "Multibilateral", AOD_eur$tipo)

# Leave the sector CAD just with the numbers identifiers, delete the blanks and store as number
AOD_eur$sectorCAD <- sapply(strsplit(AOD_eur$sectorCAD, " - "), "[[", 1)
AOD_eur$sectorCAD <- as.numeric(gsub(" ", "", AOD_eur$sectorCAD))


AOD_eurCopy2 <- AOD_eur
AOD_eur <- AOD_eurCopy2

# Set AODneta as numeric, remove the NAs generated (four registers are lost, due to the AOD neta has not been defined (value = ND))
AOD_eur$AODneta <- as.numeric(AOD_eur$AODneta)

# Aggregate the data by year and sectorCAD
AOD_agg <- aggregate(AODneta ~ sectorCAD + año, FUN = sum, data = AOD_eur)

# Create the AODdataSectors dataset for the visualization including the variables:
# "sector" concrete sector
# "href" link to the icon images
# "category"
# "color"
# "year"
# "value"
# "dif"     
# "titular"

AOD_agg$year <- AOD_agg$año
AOD_agg$año <- NULL

AOD_agg$value <- AOD_agg$AODneta
AOD_agg$AODneta <- NULL

# Add a columns for the sector and category description based on the sectorCAD code
AOD_agg <- merge(AOD_agg, CAD)

# Add a category per year, called total, that  will be sum of every
totalYear <- aggregate(value ~ year, FUN = sum, data = AOD_agg)
totalYear$sectorCAD <- 000
totalYear$category <- "Total"
totalYear$sector <- "Total"

AOD_agg <- rbind(AOD_agg, totalYear)
rm(totalYear)

# Aggregate data by sector
AOD_sec <- aggregate(value ~ category + sector + year, FUN = sum, data = AOD_agg)

# Add the color variable. 
# Set the category as ordered factor:
levels <- c(unique(CAD$category), "Total")
AOD_sec$category <- factor(AOD_sec$category, levels = levels, ordered = TRUE)
AOD_sec <- AOD_sec[order(AOD_sec$year, AOD_sec$category), ]


# Assign the colors
colors <- c("#afc94c","#76abc0","#fec93a","#f69034","#E313EE","#b7b7b7","#d14b51")
tempColors <- cbind(category= levels(AOD_sec$category), color = colors)
AOD_sec <- merge(AOD_sec, tempColors)
rm(tempColors)

# Add the dif variable 
for (i in unique(AOD_sec$year)) {
	for (j in unique(AOD_sec$sector)) {
		tempDif <- AOD_sec$value[AOD_sec$year == 2008 & AOD_sec$sector == j] - AOD_sec$value[AOD_sec$year == i & AOD_sec$sector == j]
		print(tempDif)
		print(j)
		AOD_sec$dif[AOD_sec$year == i & AOD_sec$sector == j] <- tempDif
	}
}
rm(tempDif, j, i)

# Add the difPer variable (relative increment regarding to the 2008 data)

for (i in unique(AOD_sec$year)) {
	for (j in unique(AOD_sec$sector)) {
		hundred <- AOD_sec$value[AOD_sec$year == 2008 & AOD_sec$sector == j]
		dif <- AOD_sec$dif[AOD_sec$year == i & AOD_sec$sector == j]
		tempDifPer <- round((dif*100)/hundred)
		AOD_sec$difPer[AOD_sec$year == i & AOD_sec$sector == j] <- tempDifPer
	}
}
rm(tempDifPer, j, i)

# Add the href variable, the links for the icons
# Save the sector variable as an ordered factor 
levels <- c(unique(CAD$sector), "Total")
AOD_sec$sector <- factor(AOD_sec$sector, levels = levels, ordered = TRUE)
AOD_sec <- AOD_sec[order(AOD_sec$year, AOD_sec$sector), ]

sector <- levels(AOD_sec$sector)
images <- list.files("d3Visualization/images/", "*.svg")
href <- sapply(images, function(x) paste("images/", x, sep =""))
images <- cbind(sector, href)
AOD_sec <- merge(AOD_sec, images)
AOD_sec <- AOD_sec[order(AOD_sec$year, AOD_sec$sector), ]


# Add a titular column
AOD_sec$titular[AOD_sec$year == 2008 & AOD_sec$sector == "Educación"] <- "<strong>La Ayuda Oficial al Desarrollo (AOD)</strong>, utilizada habitualmente para medir la Ayuda Internacional 
										al Desarrollo, es un término establecido por los Estados 
										miembros del Comité de Ayuda al Desarrollo de la OCDE, conocidos internacionalmente 
										como países DAC.<br>
										Uno de los <strong>objetivos</strong> que se marcaron los países DAC fue <strong>destinar el famoso 0,7% de su PIB</strong> 
										a este tipo de ayuda.<br>
										Gracias al Plan Anual de Cooperación (PACI), es posible saber qué cantidad destina España a la 
										AOD, en qué la emplea (<a href=\"http://goo.gl/5BTOUU\" target=\"_blank\">categorías y sectores</a>) y cómo ha variado 
										durante los primeros años de la crisis, <strong>tomando siempre como referencia el año 2008</strong>.<br>
										En 2008, la AOD suponía el 0,45% del PIB y el <a href=\"http://goo.gl/BEFtzd\" target=\"_blank\">Segumiento del PACI 2008</a> casi empieza diciendo \"El año 2008 consolidó a la Cooperación Española como una de las que más avanzaron en calidad y en cantidad de la AOD\".<br><br>
										<strong> ¡Selecciona cada uno de los años para ver qué ha pasado después! </strong>"



AOD_sec$titular[AOD_sec$year == 2009 & AOD_sec$sector == "Educación"] <- "<strong>La primera consecuencia de la crisis: las previsiones de crecimiento para 2009 no se cumplen</strong>. 
										Aún así, se podría decir que <strong>la AOD total se mantiene</strong> ya que sólo desciende un punto (más de 33 millones de euros!).<br>

										El Sector Social y las Ayudas No Distribuibles continúan siendo las áreas prioritarias. Sin embargo, no todo sigue igual:<br>

										- <strong>Incrementan</strong> notablemente la <strong>dotación de Bienes</strong> y la <strong>Ayuda de Emergencia</strong>, en parte como consecuencia 
										de la <a href=\"http://goo.gl/lN4FYn\" target=\"_blank\">Crisis de Gaza de 2008-2009</a><br>

										- En el ámbito económico, destaca el descenso del <strong>124%</strong> de <strong>Otros servicios económicos</strong>. 
										Los que supone un <strong>superávit de 32 millones</strong> de euros para el balance español en los <strong>reembolsos de Servicios Financieros</strong> prestados en los años anteriores.<br>

										- Las ayudas a las <strong>energías renovables en Túnez y Marruecos</strong> explican gran parte del <strong>incremento</strong> del 149% 
										en la AOD destinada al <strong>Sector Energético</strong>."

AOD_sec$titular[AOD_sec$year == 2010 & AOD_sec$sector == "Educación"] <- "En al año <strong>2010</strong> comienzan a advertirse las <strong>primeras 
											consecuencias de la crisis</strong>:<br>
											- La Ayuda total es <strong>270 millones de € más baja</strong> (-6%) que en 2008.<br>
											- El <strong>Sector Social es el más afectado</strong>: se ha reducido la Ayuda en todas 
											las categorías que lo componen; categorías que son teóricamente fundamentales 
											para el desarrollo real de un país <strong>(educación, sanidad, agua y sociedad civil)</strong>.<br>
											- Las Ayudas al desarrollo de energías renovables en Marruecos y sobre todo 
											en Túnez, siguen siendo la razón principal por la que la 
											contribución al sector energético sigue siendo mayor que en 2008.<br>
											- <strong>Buenas noticias</strong>, incrementa el apoyo a la Agricultura, la <strong>Silvicultura 
											y la Pesca</strong>, uno de los motores fundamentales de las economías de los países en vías de desarrollo.<br>
											En concreto se destinan casi 200 millones de € más al 
											desarrollo de la <strong>Agricultura</strong> en (literalmente) \"<strong>Países en vías de desarrollo, no especificados</strong>\" y 15 millones 
											de € más para empujar la <strong>Silvicultura</strong> en <strong>África Subsahariana</strong>."
AOD_sec$titular[AOD_sec$year == 2011 & AOD_sec$sector == "Educación"] <- "Es evidente que la crisis repercute en la AOD, la aportación total de España a los países en desarrollo
											<strong>se reduce</strong> en un 37%, es decir, en <strong>1.774 millones de €uros</strong>.<br>
											
											<strong>Todos los sectores se ven afectados</strong>: tanto aquellos que contribuyen a un desarrollo más estable a largo 
											plazo (social y económico) como los que solucionan problemas más urgentes (dotación de bienes, condonación 
											de deuda o ayuda de emergencia).<br>
																			   
											La <strong>excepción</strong> podría ser el <strong>Sector Productivo</strong>, quizá porque nunca ha tenido un gran peso 
											en la distribución estructural de la AOD. Sorprende que la Industria, minería y construcción, 
											hasta ahora estable y un poco olvidada dados los índices de aportación, sea la única que crezca 
											en 2011 respecto a 2008.<br>
											
											Este incremento se detecta en el <strong>Sector Industrial</strong>, donde crecen las aportaciones al <strong>Norte de África</strong> 
											(+82 millones de €) y a <strong>Haití</strong> (+ 41 millones de €), objetivo primordial del la Ayuda Internacional 
											tras el <a href=\"http://goo.gl/SZOJRb\" target=\"_blank\">terremoto de 2010</a>."

AOD_sec$titular[AOD_sec$year == 2012 & AOD_sec$sector == "Educación"] <- "<strong>2012. Las aportaciones a todas las categorías</strong>, excepto a aquellas Sin Especificar*, <strong>son mínimas</strong>.
<strong>La ayuda es un tercio de lo que fue</strong>, pasando de 4.762 millones de € en 2008 a 1.585 millones de € en este año.<br>
Hasta ese momento, el 2003 había sido el año en el que España menos había contribuído a la AOD. A partir de ahí, se fijó el objetivo de crecer en cantidad y en calidad. Así fue (al menos en cantidad) durante cinco años, hasta 2008. En los <strong>cuatro años</strong> siguientes <strong>se destruyó todo lo que se había conseguido (y 150 millones de € más)</strong>.<br>
Se entiende que esta pérdida de recursos no sólo <strong>afecta</strong> a la escasez de aportaciones nuevas, sino al <strong>mantenimiento de numerosos proyectos de desarrollo que se habían puesto en marcha antes de que la crisis llegara a occidente</strong>.<br>
*El incremento del 200% de las aportaciones no especificadas, se debe al traspaso de 746 millones de € del presupuesto de Cooperación al Ministerio de Hacienda, que no hace constar en el PACI el destino de los fondos."

# Write the AODdataSectors
write.csv(AOD_sec, "~/Dropbox/AOD/AODdata.csv", row.names = F)
