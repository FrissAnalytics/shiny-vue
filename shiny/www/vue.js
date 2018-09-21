$(document).on("shiny:connected", function(event) {
 
        // event bus
        const EventBus = new Vue({

            created() {

                // listen for  event bus events
                this.$on("bubble-bus-event", this.showEvent);

                // listen for events to send data to shiny
                this.$on("shiny", this.shiny_emit);
            },

            methods: {
                showEvent($event) {
                    let text = JSON.stringify($event);
                    d3.select("#app .bus").html(text);
                },

                // send data to shiny
                shiny_emit($event) {

                    if (typeof Shiny !== "undefined") {
                        Shiny.onInputChange($event.input_id, $event.data);
                    }
                }
            }
        });

        // make bus available everywhere in the app by attaching it to the Vue global object
        Object.defineProperties(Vue.prototype, {
            $bus: {
                get: function () {
                    return EventBus;
                }
            }
        });

        Vue.component("bubble-chart", {

            props: ["id", "width", "height", "data"],

            created: function () {
                this.debouncedDraw = _.debounce(this.draw, 100);
            },

            mounted: function () {
                this.svg = d3.select("#" + this.id);
            },

            methods: {

                // send messages to parent from bubble component
                // standard, without bus
                emit: function (type, data, index) {

                    let payload = { "id": this.id, "event": type, "data": data, "index": index };

                    let event_name = "bubble-event";

                    this.$emit(event_name, payload);
                },

                // via global bus object
                triggerBus() {
                    let payload = { "id": this.id, "event": "bus", "rnd-data": Math.random() };
                    this.$bus.$emit("bubble-bus-event", payload);
                },

                draw: function () {

                    let vm = this;

                    var myScale = d3.scaleLinear()
                        .domain(d3.extent([this.min, this.max]))
                        .range([0, this.mywidth]);

                    var base = this.svg
                        .selectAll("circle")
                        .data(this.data);

                    // update
                    base.transition()
                        .style("fill", "blue")
                        .duration(750)
                        .attr("cx", function (d) {
                            return myScale(d);
                        })
                        .delay((d, i) => i * 5)
                        .attr("r", d => Math.random() * 30);

                    // enter
                    base.enter()
                        .append("circle")
                        .style("fill", "green")
                        .style("opacity", 0.5)
                        .attr("cx", function (d) {
                            return myScale(d);
                        })
                        .attr("cy", this.height / 2)
                        .on("click", function (d, i) {
                            // trigger bubble component helper to send messsage to parent
                            // here we send the bound data d
                            vm.emit("click", d, i);
                        })
                        .on("mouseover", function (d, i) {
                            d3.select(this).style("fill", "orange");
                            vm.emit("mouseover", d, i);
                        })
                        .on("mouseout", function (d, i) {
                            d3.select(this).style("fill", "blue");
                            vm.emit("mouseout", d, i);
                        })
                        .transition()
                        .duration(750)
                        .delay((d, i) => i * 5)
                        .attr("r", d => Math.random() * 30);

                    // exit
                    base.exit()
                        .transition()
                        .duration(500)
                        .style("fill", "gray")
                        .attr("cy", 40 + this.height / 2)
                        .transition()
                        .delay(500)
                        .duration(500)
                        .delay((d, i) => i * 5)
                        .attr("cx", function (d) {
                            return myScale(d) < (vm.mywidth / 2) ? 0 : vm.mywidth;
                        })
                        .remove();
                }

            },

            computed: {
                mywidth: function () { return this.width - 100 }
            },

            watch: {

                "data": {
                    handler: function (val) {
                        this.min = d3.min(this.data) - 20;
                        this.max = d3.max(this.data) + 20;
                        this.draw();
                    }
                },

                "width": {
                    handler: function (val) {
                        this.debouncedDraw();
                    }
                },
            },

            template: `
                <div class = "custom">
                    <div class = "btn" @click="triggerBus">emit via bus</div>
                    <svg :id="id" width="100%" :height="height" ref="svg"></svg>
                </div>`
        })

        var app = new Vue({

            el: "#app",

            data: {
                width: 960,
                height: 500,
                bubble_data1: [-300, 300],
                bubble_data2: [-300, 300],
                bubble_data3: [-300, 300],
                hover_payload: null
            },

            methods: {

                setContainerDims() {
                    this.width = this.$el.clientWidth;
                    this.height = this.$el.clientHeight;
                },

                generateData(n = 5, mean = 100, sigma = 100) {

                    let normal = d3.randomNormal(mean, sigma);
                    let values = d3.range(n).map(d => normal());

                    return values;

                },

                updateData() {

                    let n1 = 1 + Math.floor(d3.randomUniform(50)());
                    let n2 = 1 + Math.floor(d3.randomUniform(50)());
                    let n3 = 1 + Math.floor(d3.randomUniform(25)());

                    this.bubble_data1 = this.generateData(n = n1);
                    this.bubble_data2 = this.generateData(n = n2);
                    this.bubble_data3 = this.generateData(n = n3);

                    this.hover_payload = null;
                },

                showMessage(payload) {

                    this.hover_payload = payload;

                    // send data from main vue instance to event bus
                    // event bus sends data to shiny
                    this.$bus.$emit("shiny", { "input_id": "bus", "data": { "id": "bus", "data": payload } });
                }
            },

            mounted: function () {

                this.setContainerDims();

                window.addEventListener("resize", this.setContainerDims);

                this.updateData();
            },

            beforeDestroy() {
                window.removeEventListener("resize", this.setContainerDims);
            }
        })

        // listen for events passed via shiny
        if (typeof Shiny !== "undefined") {
            Shiny.addCustomMessageHandler("shiny_update_vue", function (payload) {
                app.bubble_data1 = payload.data.bubble_data1;
                app.bubble_data2 = payload.data.bubble_data2;
                app.bubble_data3 = payload.data.bubble_data3;
            });
        }

        
});