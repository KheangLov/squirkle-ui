# COMPONENTS
Purpose: component inventory — name, path, key props, slots, Figma mapping. (Split out of DESIGN_SYSTEM.md.)
Read when: reusing or changing a component, or checking one exists. Grep for the row (`grep -n "| SqBtn " .ai/COMPONENTS.md`); don't read the whole file.

## Inventory (generated from source 2026-10-24; Figma column UNKNOWN until mapped)
| Component | Path | Key props / variants | Slots | Figma component |
|---|---|---|---|---|
| SqCalendar | `calendar/…/SqCalendar.vue` | v-model · view, views, events, firstDayOfWeek, editable, snap, hourHeight | — | UNKNOWN |
| SqBarChart | `charts/…/components/SqBarChart.vue` | labels, series, title, subtitle, height, stacked, horizontal | — | UNKNOWN |
| SqDonutChart | `charts/…/components/SqDonutChart.vue` | data, title, subtitle, size, thickness, totalLabel, flat | center | UNKNOWN |
| SqLineChart | `charts/…/components/SqLineChart.vue` | labels, series, title, subtitle, height, area, smooth | — | UNKNOWN |
| SqSparkline | `charts/…/components/SqSparkline.vue` | data, width, height, color, fill, label | — | UNKNOWN |
| SqDataGrid | `datagrid/…/SqDataGrid.vue` | rows, columns, defaultColDef, rowId, height, rowHeight, headerHeight | default, cell, detail, group, loading, no-rows, toolbar (+`cell-<colId>`, `header-<colId>`) | UNKNOWN |
| SqIconPicker | `icons/…/SqIconPicker.vue` | v-model · prefixes, columns, height, limit, placeholder | — | UNKNOWN |
| SqMap | `map/…/SqMap.vue` | engine (vector \| raster), mapStyle, center, zoom, markers, markerDefaults, cluster, clusterColor, fitMarkers, tileUrl, attribution, height, rounded | marker, popup | UNKNOWN |
| SqSwiper | `swiper/…/SqSwiper.vue` | v-model · items, itemKey, slidesPerView, spaceBetween, breakpoints, effect, loop | default | UNKNOWN |
| SqAlert | `ui/…/components/SqAlert.vue` | v-model · type, title, text, color, variant, icon, closable | default, append, title | UNKNOWN |
| SqApp | `ui/…/components/SqApp.vue` | theme, fullHeight | default | UNKNOWN |
| SqAppBar | `ui/…/components/SqAppBar.vue` | title, height, color, flat, floating, blur | default, append, prepend, title | UNKNOWN |
| SqAutocomplete | `ui/…/components/SqAutocomplete.vue` | = SqSelect + | — | UNKNOWN |
| SqAvatar | `ui/…/components/SqAvatar.vue` | image, alt, icon, name, size, color, variant | default | UNKNOWN |
| SqBadge | `ui/…/components/SqBadge.vue` | content, max, color, dot, icon, hidden, inline | default | UNKNOWN |
| SqBanner | `ui/…/components/SqBanner.vue` | text, icon, color, sticky | default, actions | UNKNOWN |
| SqBottomNavigation | `ui/…/components/SqBottomNavigation.vue` | v-model · items, color, floating | — | UNKNOWN |
| SqBottomSheet | `ui/…/components/SqBottomSheet.vue` | = SqDialog + | — | UNKNOWN |
| SqBreadcrumbs | `ui/…/components/SqBreadcrumbs.vue` | items, divider | — | UNKNOWN |
| SqBtn | `ui/…/components/SqBtn.vue` | text, variant, color, size, rounded, icon, prependIcon | default, loader | UNKNOWN |
| SqBtnGroup | `ui/…/components/SqBtnGroup.vue` | rounded, divided, color | default | UNKNOWN |
| SqBtnToggle | `ui/…/components/SqBtnToggle.vue` | v-model · multiple, mandatory, disabled, divided, rounded | default | UNKNOWN |
| SqCard | `ui/…/components/SqCard.vue` | title, subtitle, text, image, prependIcon, variant, color | default, actions, append, prepend, subtitle, title | UNKNOWN |
| SqCardActions | `ui/…/components/SqCardActions.vue` |  | default | UNKNOWN |
| SqCardText | `ui/…/components/SqCardText.vue` |  | default | UNKNOWN |
| SqCardTitle | `ui/…/components/SqCardTitle.vue` |  | default | UNKNOWN |
| SqCheckbox | `ui/…/components/SqCheckbox.vue` | v-model · value, trueValue, falseValue, label, color, indeterminate, disabled, …validation | default | UNKNOWN |
| SqChip | `ui/…/components/SqChip.vue` | text, color, variant, size, rounded, prependIcon, appendIcon | default | UNKNOWN |
| SqChipGroup | `ui/…/components/SqChipGroup.vue` | v-model · multiple, mandatory, max, column, disabled | default | UNKNOWN |
| SqCol | `ui/…/components/SqCol.vue` | cols, sm, md, lg, xl, offset | default | UNKNOWN |
| SqColorPicker | `ui/…/components/SqColorPicker.vue` | v-model · alpha, flat, swatches | — | UNKNOWN |
| SqCombobox | `ui/…/components/SqCombobox.vue` | = SqSelect + | — | UNKNOWN |
| SqContainer | `ui/…/components/SqContainer.vue` |  | default | UNKNOWN |
| SqDateField | `ui/…/components/SqDateField.vue` | v-model · label, placeholder, range, clearable, disabled, min, max | — | UNKNOWN |
| SqDatePicker | `ui/…/components/SqDatePicker.vue` | v-model · range, multiple, min, max, allowedDates, events, firstDayOfWeek | actions | UNKNOWN |
| SqDialog | `ui/…/components/SqDialog.vue` | v-model · title, width, maxWidth, persistent, fullscreen, scrollable, closable | default, actions, activator, title | UNKNOWN |
| SqDivider | `ui/…/components/SqDivider.vue` |  | default | UNKNOWN |
| SqEmptyState | `ui/…/components/SqEmptyState.vue` | icon, title, text, color | default, actions, media | UNKNOWN |
| SqExpandTransition | `ui/…/components/SqExpandTransition.vue` |  | default | UNKNOWN |
| SqExpansionPanel | `ui/…/components/SqExpansionPanel.vue` | title, text, icon, value, disabled | default, title | UNKNOWN |
| SqExpansionPanels | `ui/…/components/SqExpansionPanels.vue` | v-model · multiple, variant, disabled | default | UNKNOWN |
| SqField | `ui/…/components/SqField.vue` | id, label, hint, persistentHint, messages, error, variant | default, append-inner, prepend-inner | UNKNOWN |
| SqFileInput | `ui/…/components/SqFileInput.vue` | v-model · label, hint, accept, multiple, maxSize, disabled, showList | default | UNKNOWN |
| SqFooter | `ui/…/components/SqFooter.vue` |  | default | UNKNOWN |
| SqForm | `ui/…/components/SqForm.vue` |  | default | UNKNOWN |
| SqIcon | `ui/…/components/SqIcon.vue` | icon, size, color, label, clickable | default | UNKNOWN |
| SqImg | `ui/…/components/SqImg.vue` | src, srcset, alt, aspectRatio, width, height, cover | default, error, placeholder | UNKNOWN |
| SqInfiniteScroll | `ui/…/components/SqInfiniteScroll.vue` | loading, hasMore, height, margin, manual | default, end, load-more, loading | UNKNOWN |
| SqKbd | `ui/…/components/SqKbd.vue` |  | default | UNKNOWN |
| SqLazy | `ui/…/components/SqLazy.vue` | minHeight, rootMargin, transition | default | UNKNOWN |
| SqList | `ui/…/components/SqList.vue` | v-model · items, itemTitle, itemValue, selectable, multiple, mandatory, nav | default, item | UNKNOWN |
| SqListGroup | `ui/…/components/SqListGroup.vue` | v-model · title, prependIcon | default | UNKNOWN |
| SqListItem | `ui/…/components/SqListItem.vue` | title, subtitle, prependIcon, prependAvatar, appendIcon, value, active | default, append, prepend, title | UNKNOWN |
| SqListSubheader | `ui/…/components/SqListSubheader.vue` |  | default | UNKNOWN |
| SqMain | `ui/…/components/SqMain.vue` |  | default | UNKNOWN |
| SqMenu | `ui/…/components/SqMenu.vue` | v-model · location, offset, openOnHover, openOnClick, openOnFocus, openDelay, closeDelay | default, activator | UNKNOWN |
| SqNavigationDrawer | `ui/…/components/SqNavigationDrawer.vue` | v-model · location, width, railWidth, rail, temporary, permanent, floating | default, append, prepend | UNKNOWN |
| SqNumberInput | `ui/…/components/SqNumberInput.vue` | v-model · min, max, step, precision, controlVariant, …fieldShell/validation | — | UNKNOWN |
| SqOtpInput | `ui/…/components/SqOtpInput.vue` | v-model · length, type, masked, disabled, error, label | — | UNKNOWN |
| SqOverlay | `ui/…/components/SqOverlay.vue` | v-model · persistent, contained, opacity | default | UNKNOWN |
| SqPagination | `ui/…/components/SqPagination.vue` | v-model · length, totalVisible, color, size, variant, disabled | — | UNKNOWN |
| SqPortal | `ui/…/components/SqPortal.vue` | target, disabled | default | UNKNOWN |
| SqProgressCircular | `ui/…/components/SqProgressCircular.vue` | indeterminate, size, width, color | default | UNKNOWN |
| SqProgressLinear | `ui/…/components/SqProgressLinear.vue` | bufferValue, indeterminate, striped, height, color | default | UNKNOWN |
| SqRadio | `ui/…/components/SqRadio.vue` | v-model · value, label, color, name, disabled | default | UNKNOWN |
| SqRadioGroup | `ui/…/components/SqRadioGroup.vue` | v-model · items, label, inline, color, disabled, …validation | default | UNKNOWN |
| SqRangeSlider | `ui/…/components/SqRangeSlider.vue` | = SqSlider + | — | UNKNOWN |
| SqRating | `ui/…/components/SqRating.vue` | v-model · length, color, fullIcon, emptyIcon, size, readonly, disabled | — | UNKNOWN |
| SqRow | `ui/…/components/SqRow.vue` | dense, noGutters, align, justify | default | UNKNOWN |
| SqSelect | `ui/…/components/SqSelect.vue` | v-model · items, itemTitle, itemValue, itemSubtitle, multiple, chips, closableChips, …fieldShell/validation | item, no-data | UNKNOWN |
| SqShape | `ui/…/components/SqShape.vue` | watchKey, clip | — | UNKNOWN |
| SqSheet | `ui/…/components/SqSheet.vue` | tag, color, border, elevation, rounded, width, height | default | UNKNOWN |
| SqSkeleton | `ui/…/components/SqSkeleton.vue` | type, lines, height | — | UNKNOWN |
| SqSlideGroup | `ui/…/components/SqSlideGroup.vue` |  | default | UNKNOWN |
| SqSlider | `ui/…/components/SqSlider.vue` | v-model · min, max, step, range, label, color, thumbLabel | append, prepend | UNKNOWN |
| SqSnackbar | `ui/…/components/SqSnackbar.vue` | v-model · text, icon, color, timeout, showTimer, location | default, actions | UNKNOWN |
| SqSpacer | `ui/…/components/SqSpacer.vue` |  | — | UNKNOWN |
| SqSpeedDial | `ui/…/components/SqSpeedDial.vue` | v-model · icon, color, actions, direction, openOnHover | — | UNKNOWN |
| SqStepper | `ui/…/components/SqStepper.vue` | v-model · items, vertical, editable, hideActions, finishText | default | UNKNOWN |
| SqSwitch | `ui/…/components/SqSwitch.vue` | v-model · trueValue, falseValue, label, color, inset, loading, disabled | default | UNKNOWN |
| SqTab | `ui/…/components/SqTab.vue` | text, value, prependIcon, disabled | default | UNKNOWN |
| SqTable | `ui/…/components/SqTable.vue` | striped, hover, fixedHeader, height, density | default | UNKNOWN |
| SqTabs | `ui/…/components/SqTabs.vue` | v-model · items, variant, color, grow, vertical | default | UNKNOWN |
| SqTextField | `ui/…/components/SqTextField.vue` | v-model · type, name, autocomplete, inputmode, maxlength, counter, …fieldShell/validation | append-inner, prepend-inner | UNKNOWN |
| SqTextarea | `ui/…/components/SqTextarea.vue` | v-model · rows, autoGrow, noResize, maxlength, counter, …fieldShell/validation | — | UNKNOWN |
| SqThemeProvider | `ui/…/components/SqThemeProvider.vue` | theme, withBackground | default | UNKNOWN |
| SqTimePicker | `ui/…/components/SqTimePicker.vue` | v-model · format, useSeconds, minuteStep, color, flat | — | UNKNOWN |
| SqTimeline | `ui/…/components/SqTimeline.vue` | align, dense | default | UNKNOWN |
| SqTimelineItem | `ui/…/components/SqTimelineItem.vue` | title, time, icon, color, small | default, opposite | UNKNOWN |
| SqToolbar | `ui/…/components/SqToolbar.vue` | title, color, dense, floating | default | UNKNOWN |
| SqTooltip | `ui/…/components/SqTooltip.vue` | v-model · text, location, offset, openDelay, closeDelay, disabled, activator | default, activator, content | UNKNOWN |
| SqTreeview | `ui/…/components/SqTreeview.vue` | v-model · opened, activated, items, itemTitle, itemValue, itemChildren, selectable | append, title | UNKNOWN |
| SqVirtualScroll | `ui/…/components/SqVirtualScroll.vue` | items, itemHeight, estimatedItemHeight, height, overscan, itemKey, infinite | default, empty, end, loading | UNKNOWN |
| SqWindow | `ui/…/components/SqWindow.vue` | v-model · showArrows, continuous | default | UNKNOWN |
| SqWindowItem | `ui/…/components/SqWindowItem.vue` |  | default | UNKNOWN |
