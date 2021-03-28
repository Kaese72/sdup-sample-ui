function triggerSimpleCapability(device_id, capability_key) {
  $.post("/capability/" + device_id + "/" + capability_key)
}

function colorchange(device_id, x, y) {
  $.post("/capability/" + device_id + "/setcolorxy", JSON.stringify({"x": parseFloat(x), "y": parseFloat(y)}), null, "json");
}

function genTemplatedDeviceRow(device){
  let clone = document.querySelector("#template_device_inventory_row");
  for (let attribute of data)
}

function genFullTable(data) {
  let table = document.querySelector("#device_inventory");
  console.log(data)

  for (let device of data) {
    let row = table.insertRow();
    if ('description' in device["attributes"]) {
      //If a description is available, use it
      row.insertCell().appendChild(document.createTextNode(device["attributes"]["description"]["string-state"]))

    } else {
      //If no description is available, display the device ID
      row.insertCell().appendChild(document.createTextNode(device["id"]))
    }
    let cell = row.insertCell()
    cell.id = device["id"] + "_active_state"
    cell.appendChild(document.createTextNode(device["attributes"]["active"]["boolean-state"]))

    // Create on button
    let onButton = document.createElement('button');
    onButton.innerHTML = "Activate"
    onButton.addEventListener('click', function(){
      triggerSimpleCapability(device["id"], "activate");
    });
    row.insertCell().appendChild(onButton)

    // Create off button
    let offButton = document.createElement('button');
    offButton.innerHTML = "Deactivate"
    offButton.addEventListener('click', function(){
      triggerSimpleCapability(device["id"], "deactivate");
    });
    row.insertCell().appendChild(offButton)


    if ('colorxy' in device["attributes"]) {
      // Create color form button
      //let colorform = document.createElement('form');

      let xInput = document.createElement("input")
      xInput.setAttribute("type", "number")
      xInput.setAttribute("value", device["attributes"]["colorxy"]["keyval-state"]["x"])
      xInput.setAttribute("name", "x")
      xInput.id = device["id"] + "_color_x"

      let yInput = document.createElement("input")
      yInput.setAttribute("type", "number")
      yInput.setAttribute("value", device["attributes"]["colorxy"]["keyval-state"]["y"])
      yInput.setAttribute("name", "y")
      yInput.id = device["id"] + "_color_y"

      var submission = document.createElement("button");
      submission.innerHTML = "Change color";
      submission.addEventListener('click', function(){
        colorchange(device["id"], document.getElementById(device["id"] + "_color_x").value, document.getElementById(device["id"] + "_color_y").value);
      });

      row.insertCell().appendChild(xInput)
      row.insertCell().appendChild(yInput)
      row.insertCell().appendChild(submission)


      //row.insertCell().appendChild(colorform)
    }
  }

}
//FIXME Make sure build table works first

$.getJSON("/discovery", "", genFullTable);

var eSource = new EventSource("/subscribe");

//Now bind various Events , Message, and Error to this event
eSource.addEventListener('open', function(e) {
  console.log("Connection was opened.")
}, false);

eSource.addEventListener('message', function(e) {
  let json_obj = JSON.parse(e.data)
  console.log(json_obj);
  if ('active' in json_obj["attributes"]) {
    document.getElementById(json_obj.id + "_active_state").innerHTML = json_obj["attributes"]["active"]["boolean-state"]

  } else if ('colorxy' in json_obj["attributes"]) {
    document.getElementById(json_obj.id + "_color_y").value = json_obj["attributes"]["colorxy"]["keyval-state"]["y"]
    document.getElementById(json_obj.id + "_color_x").value = json_obj["attributes"]["colorxy"]["keyval-state"]["x"]
  } else {
    console.log("Message does not contain recognizable change")
  }

}, false);

eSource.addEventListener('error', function(e) {
  if (e.readyState == EventSource.CLOSED) {
    console.log("Connection was closed. ");
  }
  console.log(e);
}, false);
