import Vue from 'vue'
import * as ui from '@squirkle-ui/ui/vue2'
import { getThemeCss, config } from '@squirkle-ui/ui/vue2'
<% options.addons.forEach(function (a) { %>import * as addon_<%= a %> from '@squirkle-ui/<%= a %>/vue2'
<% }) %>
Vue.use(ui.createSquirkle({ ...<%= JSON.stringify(options.runtime) %>, components: false }))
const rename = (n) => n.replace(/^Sq/, <%= JSON.stringify(options.prefix) %>)
for (const name of ui.componentNames) Vue.component(rename(name), ui[name])
<% options.addons.forEach(function (a) { %>for (const name of addon_<%= a %>.componentNames || []) Vue.component(rename(name), addon_<%= a %>[name])
<% }) %>
export default ({ app }) => {
  const head = (app.head = app.head || {})
  head.style = (head.style || []).concat({ hid: 'sq-theme-vars', innerHTML: getThemeCss() })
  // Theme CSS is generated from the app's own config (not user input), so it may skip vue-meta's sanitizer.
  head.__dangerouslyDisableSanitizersByTagID = Object.assign({}, head.__dangerouslyDisableSanitizersByTagID, { 'sq-theme-vars': ['innerHTML'] })
  head.htmlAttrs = Object.assign({}, head.htmlAttrs, { class: 'sq-theme--' + config.theme.name })
}
