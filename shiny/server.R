shinyServer(function(input, output, session) {
   
  # listen for data send from browser via event bus
  output$bus <- renderUI({
    
    req(input$bus)
  
    tagList(
      fluidRow( id = "shiny_result",
        column(2, h5("received by shiny from vue")),       
        column(2, h5("type:"), input$bus$id),
        column(2, h5("component id:"), input$bus$data$id),
        column(2, h5("event:"), input$bus$data$event),
        column(2, h5("data:"), input$bus$data$index),
        column(2, h5("item index:"), input$bus$data$data)
      )
    )

  })
  
  # on updateVue, send some new data to the browser
  observeEvent(input$updateVue,{
    
      # number of items to generate
      n1 <- floor(runif(1, min=1, max=50))
      n2 <- floor(runif(1, min=1, max=50))
      n3 <- floor(runif(1, min=1, max=25))
    
      # data object to send to javascript
      payload <- list( 
      
        # bubble data
        data = list( 
          bubble_data1 = rnorm(n1, mean=100, sd=100),
          bubble_data2 = rnorm(n2, mean=100, sd=100),
          bubble_data3 = rnorm(n3, mean=100, sd=100)
        )
      )
              
      # run shiny handler on javascript with name shiny_update_vue
      # and pass it our payload
      session$sendCustomMessage("shiny_update_vue", payload)
  })
  
})
