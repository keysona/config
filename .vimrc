set hlsearch
set backspace=2
set ruler
set showmode
set rnu
set bg=dark

filetype plugin indent on
" show existing tab with 4 spaces width
set tabstop=4
" when indenting with '>', use 4 spaces width
set shiftwidth=4
" On pressing tab, insert 4 spaces
set expandtab

map <f8> :w<CR>:!dot -Tpng -o %<.png % && eog %<.png<CR>  
