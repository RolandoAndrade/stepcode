// @vitest-environment happy-dom
import { startCompletion } from '@codemirror/autocomplete'
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { profiles } from '@stepcode/profiles'
import { describe, expect, it } from 'vitest'
import { stepcode } from '../src/index'

describe('stepcode({ completion })', () => {
  it('omits autocompletion when completion is false', () => {
    const on = EditorState.create({ doc: 'Proc', extensions: stepcode({ profile: profiles.es }) })
    const off = EditorState.create({
      doc: 'Proc',
      extensions: stepcode({ profile: profiles.es, completion: false }),
    })
    const onView = new EditorView({ state: on })
    const offView = new EditorView({ state: off })
    // `startCompletion` returns false when no autocompletion extension is installed at all;
    // with the extension present it always returns true, whether or not it finds a match.
    expect(startCompletion(offView)).toBe(false)
    expect(startCompletion(onView)).toBe(true)
    onView.destroy()
    offView.destroy()
  })
})
