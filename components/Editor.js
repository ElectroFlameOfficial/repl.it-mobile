import React, { Component } from 'react'
import { View, WebView } from 'react-native'
import editorCode from '../lib/editor.js'

export default class extends Component {
  render() {
    return (
      <View style={{
        height: '100%',
        display: this.props.hidden ? 'none' : 'flex'
      }}>
        <WebView
          useWebKit={true}
          originWhitelist={[ '*' ]}
          source={{ html: editorCode }}
          ref={(webview) => this.webview = webview}
          onMessage={this.onMessage}
        />
      </View>
    )
  }

  componentDidUpdate() {
    if (this.props.code && this.webview) {
      this.webview.postMessage(JSON.stringify({
        code: this.props.code,
        path: this.props.path || ''
      }))
    }
  }
}