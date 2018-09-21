shinyUI(
  fluidPage(
    
    includeScript("https://d3js.org/d3.v4.min.js"),
    includeScript("https://cdn.jsdelivr.net/npm/lodash@4.13.1/lodash.min.js"),
    includeScript("https://cdn.jsdelivr.net/npm/vue/dist/vue.js"),
    includeScript("www/vue.js"),
    includeCSS("www/style.css"),
    
    # raw HTML
    HTML('
         
      <div id="app" ref="app">
    
        <div class="flex-container">
            <div style="flex-grow: 1" class="btn" @click="updateData()">update data</div>
            <div style="flex-grow: 2">{{hover_payload}}</div>
            <div style="flex-grow: 2" class="bus">...</div>
        </div>
    
        <bubble-chart v-on:bubble-event="showMessage" id="chart1" :width="width" :height=150 :data="bubble_data1"></bubble-chart>
        <bubble-chart v-on:bubble-event="showMessage" id="chart2" :width="width" :height=150 :data="bubble_data2"></bubble-chart>
        <bubble-chart v-on:bubble-event="showMessage" id="chart3" :width="width" :height=150 :data="bubble_data3"></bubble-chart>

      </div>

    '),
    
    br(),
    
    fluidRow(
      
      column(2, 
            actionButton("updateVue", "shiny update", size="extra-small", block = TRUE)
      ),
      
      column(10, 
             uiOutput("bus")
             
      )
      
    )

))
