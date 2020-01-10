import marked from 'marked'
import _ from 'lodash'

const htmlEscapeToText = function (text) {
  return text.replace(/&#[0-9]*;|&amp;/g, function (escapeCode) {
    if (escapeCode.match(/amp/)) {
      return '&'
    }

    return String.fromCharCode(escapeCode.match(/[0-9]+/))
  })
}

// return a custom renderer for marked.
const renderPlain = function () {
  const render = new marked.Renderer()

  // render just the text of a link
  render.link = function (href, title, text) {
    return text
  }

  // render just the text of a paragraph
  render.paragraph = function (text) {
    return htmlEscapeToText(text) + '\r\n'
  }

  // render just the text of a heading element
  render.heading = function (text, level) {
    return level + ' ) ' + text
  }

  // render nothing for images
  render.image = function (href, title, text) {
    return ''
  }

  return render
}

const plaintextRender = (md, options) => {
  return marked(md, _.merge(options, { renderer: renderPlain() }))
}

export const markdown = marked
export const plaintext = plaintextRender
