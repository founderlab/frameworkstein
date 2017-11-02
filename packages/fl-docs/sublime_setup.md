# [Sublime](http://www.sublimetext.com/) addons and things

1.  [Package control](https://packagecontrol.io/installation) - Install this first. It will let you add all sorts of fun stuff to sublime.

2.  Hit cmd-shift-p and select `Package Control: Install Package`. Install these:
    - Babel [link](https://github.com/babel/babel-sublime)
    - GitGutter [link](https://github.com/jisaacks/GitGutter)
    - Stylus [link](https://github.com/billymoon/Stylus)
    - SideBarEnhancements [link](https://github.com/titoBouzout/SideBarEnhancements)
    - CSS3 [link](https://github.com/y0ssar1an/CSS3)

3. Hook up syntaxes:
    Open a .js file. Select `View -> Syntax -> Open all with current extension as -> Babel -> JavScript (Babel)`
    Open a .styl file. Select `View -> Syntax -> Open all with current extension as -> Stylus`

4. Set up linting
    - Install these packages:
        - SublimeLinter
        - SublimeLinter-contrib-eslint
    - Open up the linting config file `Preferences -> Package Settings -> SublimeLinter -> Settings — User

5. (optional - settings config)
   Select `Sublime Text -> Preferences -> Settings - User`
   Add these settings and save:
```
    {
        "tab_size": 2,
        "caret_extra_width": 1,
        "caret_style": "phase",
        "close_windows_when_empty": false,
        "drag_text": true,
        "draw_minimap_border": true,
        "enable_tab_scrolling": false,
        "find_selected_text": true,
        "font_options":
        [
            "no_round"
        ],
        "font_size": 14,
        "highlight_line": true,
        "ignored_packages":
        [
            "CSS",
            "Vintage"
        ],
        "index_exclude_patterns":
        [
            "*.log"
        ],
        "open_files_in_new_window": false,
        "overlay_scroll_bars": "enabled",
        "preview_on_click": false,
        "save_on_focus_lost": true,
        "scroll_past_end": true,
        "scroll_speed": 5.0,
        "shift_tab_unindent": true,
        "show_full_path": false,
        "translate_tabs_to_spaces": true,
        "trim_trailing_white_space_on_save": true,
        "word_wrap": false
    }
```