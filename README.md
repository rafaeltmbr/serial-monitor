# Serial Monitor
Enhanced serial monitor with widgets (graphs, buttons, knobs etc).

## Todo
List of all tasks that should be done before the first release.

### UX
- [x] Show an error message when fail to open the serial port (e.g. device busy or connection canceled).
- [ ] Implement autoscroll when scrolling to the bottom of the list and also support its counterpart (i.e. cancel autoscroll when scrolling up). An autoscroll button can also be added to improve the UX.
- [ ] Set the tab index order (e.g. after focusing the search input, focus should go to category filters when tab is pressed).
- [x] Show the current filtering setence (e.g. 'Showing results for "temperature" in "warn" category').

### feature
- [x] Allow the user to filter by system info logs (e.g. filter by info like "Device connected" etc).
- [ ] Add the send message input and its complete functionality.
- [ ] Add support for incoming commands through logs (e.g. warns, errors etc).
- [ ] Fullscreen mode
- [ ] Light mode
### performance
- [ ] Implement the window technique in order to support big log lists (i.e. lists with 50+ logs).